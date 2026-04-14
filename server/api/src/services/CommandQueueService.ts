import type { Database } from 'sql.js'
import { randomUUID } from 'node:crypto'

import type {
  CommandAckRequest,
  CommandQueueResponse,
  QueuedCommand,
  QueuePumpCommandRequest,
} from '@anthos/shared'
import type { LogArchiveService } from './LogArchiveService.js'

type CommandRow = Record<string, unknown>

export class CommandQueueService {
  constructor(
    private readonly db: Database,
    private readonly saveDb: () => Promise<void>,
    private readonly logArchive: LogArchiveService
  ) {}

  async enqueuePumpCommand(nodeId: string, request: QueuePumpCommandRequest): Promise<QueuedCommand> {
    const now = Date.now()
    const command: QueuedCommand = {
      commandId: randomUUID(),
      nodeId,
      type: 'pump',
      status: 'pending',
      payload: { durationMs: request.durationMs },
      createdAt: now,
      updatedAt: now,
    }

    const stmt = this.db.prepare(
      `
      INSERT INTO commands (
        command_id, node_id, type, status, payload_json, created_at, updated_at, acknowledged_at, result_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)
    `
    )
    stmt.run([
      command.commandId,
      command.nodeId,
      command.type,
      command.status,
      JSON.stringify(command.payload),
      command.createdAt,
      command.updatedAt,
    ])
    stmt.free()
    await this.saveDb()

    await this.logArchive.recordEntry({
      nodeId,
      level: 'info',
      source: 'command-queue',
      message: `Pump command queued for ${nodeId}`,
      meta: {
        commandId: command.commandId,
        durationMs: request.durationMs,
      },
    })

    return command
  }

  getPendingCommands(nodeId: string, capability: 'earth' | 'watering'): CommandQueueResponse {
    const stmt = this.db.prepare(
      `
      SELECT command_id, node_id, type, status, payload_json, created_at, updated_at
      FROM commands
      WHERE node_id = ? AND status = 'pending'
      ORDER BY created_at ASC
    `
    )
    stmt.bind([nodeId])

    const commands: QueuedCommand[] = []
    while (stmt.step()) {
      commands.push(this.rowToCommand(stmt.getAsObject() as CommandRow))
    }
    stmt.free()

    return { nodeId, capability, commands }
  }

  async acknowledgeCommand(
    nodeId: string,
    commandId: string,
    request: CommandAckRequest
  ): Promise<QueuedCommand | null> {
    const existing = this.getCommand(nodeId, commandId)
    if (!existing) return null

    if (existing.status !== 'pending') {
      return existing
    }

    const now = Date.now()
    const stmt = this.db.prepare(
      `
      UPDATE commands
      SET status = ?, updated_at = ?, acknowledged_at = ?, result_message = ?
      WHERE command_id = ? AND node_id = ? AND status = 'pending'
    `
    )
    stmt.run([
      request.result,
      now,
      now,
      request.message ?? null,
      commandId,
      nodeId,
    ])
    stmt.free()
    await this.saveDb()

    await this.logArchive.recordEntry({
      nodeId,
      level: request.result === 'completed' ? 'info' : 'warn',
      source: 'command-queue',
      message: `Pump command ${request.result} for ${nodeId}`,
      meta: {
        commandId,
        result: request.result,
        message: request.message ?? null,
      },
    })

    return {
      ...existing,
      status: request.result,
      updatedAt: now,
    }
  }

  private getCommand(nodeId: string, commandId: string): QueuedCommand | null {
    const stmt = this.db.prepare(
      `
      SELECT command_id, node_id, type, status, payload_json, created_at, updated_at
      FROM commands
      WHERE node_id = ? AND command_id = ?
    `
    )
    stmt.bind([nodeId, commandId])

    if (!stmt.step()) {
      stmt.free()
      return null
    }

    const command = this.rowToCommand(stmt.getAsObject() as CommandRow)
    stmt.free()
    return command
  }

  private rowToCommand(row: CommandRow): QueuedCommand {
    const payloadJson = String(row['payload_json'] ?? '{}')
    let payload: { durationMs?: number } = {}
    try {
      payload = JSON.parse(payloadJson) as { durationMs?: number }
    } catch {
      payload = {}
    }

    return {
      commandId: String(row['command_id']),
      nodeId: String(row['node_id']),
      type: String(row['type']) as 'pump',
      status: String(row['status']) as 'pending' | 'completed' | 'failed',
      payload: { durationMs: Number(payload.durationMs ?? 0) },
      createdAt: Number(row['created_at']),
      updatedAt: Number(row['updated_at']),
    }
  }
}
