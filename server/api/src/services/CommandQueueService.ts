import type { Database } from 'sql.js'
import { randomUUID } from 'node:crypto'

import type {
  CommandAckRequest,
  CommandQueueResponse,
  QueuedCommand,
  QueuePowerProfileCommandRequest,
  QueuePumpCommandRequest,
} from '@anthos/shared'
import { CommandType } from '@anthos/shared'
import type { LogArchiveService } from './LogArchiveService.js'

type CommandRow = Record<string, unknown>

const PUMP_MS_PER_ML = 200

export class CommandQueueService {
  constructor(
    private readonly db: Database,
    private readonly saveDb: () => Promise<void>,
    private readonly logArchive: LogArchiveService
  ) {}

  async enqueuePumpCommand(nodeId: string, request: QueuePumpCommandRequest): Promise<QueuedCommand> {
    const now = Date.now()
    const durationMs = Math.max(1, Math.round(request.volumeMl * PUMP_MS_PER_ML))
    const command: QueuedCommand = {
      commandId: randomUUID(),
      nodeId,
      type: CommandType.Pump,
      status: 'pending',
      payload: { volumeMl: request.volumeMl, durationMs },
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
        volumeMl: request.volumeMl,
        durationMs,
      },
    })

    return command
  }

  async enqueuePowerProfileCommand(nodeId: string, request: QueuePowerProfileCommandRequest): Promise<QueuedCommand> {
    const now = Date.now()
    const command: QueuedCommand = {
      commandId: randomUUID(),
      nodeId,
      type: CommandType.PowerProfile,
      status: 'pending',
      payload: {
        profileId: request.profileId,
        telemetryIntervalMs: request.telemetryIntervalMs,
        queueIntervalMs: request.queueIntervalMs,
      },
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
      message: `Power profile command queued for ${nodeId}`,
      meta: {
        commandId: command.commandId,
        profileId: request.profileId,
        telemetryIntervalMs: request.telemetryIntervalMs,
        queueIntervalMs: request.queueIntervalMs,
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
      message: `${this.describeCommand(existing.type)} command ${request.result} for ${nodeId}`,
      meta: {
        commandId,
        type: existing.type,
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

  getCommand(nodeId: string, commandId: string): QueuedCommand | null {
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
    let payload: Record<string, unknown> = {}
    try {
      payload = JSON.parse(payloadJson) as Record<string, unknown>
    } catch {
      payload = {}
    }

    const type = String(row['type']) as CommandType

    return {
      commandId: String(row['command_id']),
      nodeId: String(row['node_id']),
      type,
      status: String(row['status']) as 'pending' | 'completed' | 'failed',
      payload: this.normalizePayload(type, payload),
      createdAt: Number(row['created_at']),
      updatedAt: Number(row['updated_at']),
    }
  }

  private normalizePayload(type: CommandType, payload: Record<string, unknown>) {
    if (type === CommandType.PowerProfile) {
      return {
        profileId: String(payload.profileId ?? ''),
        telemetryIntervalMs: Number(payload.telemetryIntervalMs ?? 0),
        queueIntervalMs: Number(payload.queueIntervalMs ?? 0),
      }
    }

    return {
      volumeMl: Number(payload.volumeMl ?? 0),
      durationMs: Number(payload.durationMs ?? 0),
    }
  }

  private describeCommand(type: CommandType): string {
    switch (type) {
      case CommandType.PowerProfile:
        return 'Power profile'
      case CommandType.Pump:
      default:
        return 'Pump'
    }
  }
}
