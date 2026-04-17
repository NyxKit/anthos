import { beforeEach, describe, expect, it, vi } from 'vitest'
import initSqlJs, { Database } from 'sql.js'
import { CommandType } from '@anthos/shared'

import { CommandQueueService } from '../src/services/CommandQueueService.js'

async function createDb(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE commands (
      command_id TEXT PRIMARY KEY,
      node_id TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      acknowledged_at INTEGER,
      result_message TEXT
    )
  `)

  return db
}

describe('CommandQueueService', () => {
  let db: Database
  let saveDb: ReturnType<typeof vi.fn>
  let logArchive: { recordEntry: ReturnType<typeof vi.fn> }

  beforeEach(async () => {
    db = await createDb()
    saveDb = vi.fn().mockResolvedValue(undefined)
    logArchive = {
      recordEntry: vi.fn().mockResolvedValue(undefined),
    }
  })

  it('queues commands, returns pending commands, and acknowledges them', async () => {
    const service = new CommandQueueService(db, saveDb, logArchive as never)

    const queued = await service.enqueuePumpCommand('node-001', { volumeMl: 100 })
    expect(queued.nodeId).toBe('node-001')
    expect(queued.type).toBe(CommandType.Pump)
    expect(queued.status).toBe('pending')
    expect(saveDb).toHaveBeenCalledTimes(1)
    expect(logArchive.recordEntry).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: 'node-001',
      source: 'command-queue',
      message: 'Pump command queued for node-001',
    }))

    const pending = service.getPendingCommands('node-001')
    expect(pending.nodeId).toBe('node-001')
    expect(pending.commands).toHaveLength(1)
    expect(pending.commands[0]?.payload.volumeMl).toBe(100)
    expect(pending.commands[0]?.payload.durationMs).toBe(20000)

    const acked = await service.acknowledgeCommand('node-001', queued.commandId, {
      result: 'completed',
    })

    expect(acked?.status).toBe('completed')
    expect(saveDb).toHaveBeenCalledTimes(2)
    expect(logArchive.recordEntry).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: 'node-001',
      source: 'command-queue',
      message: 'Pump command completed for node-001',
    }))
    expect(service.getPendingCommands('node-001').commands).toHaveLength(0)
  })

  it('queues and acknowledges power profile commands', async () => {
    const service = new CommandQueueService(db, saveDb, logArchive as never)

    const queued = await service.enqueuePowerProfileCommand('node-001', {
      readIntervalMs: 600000,
      telemetryIntervalMs: 600000,
      queueIntervalMs: 600000,
    })

    expect(queued.type).toBe(CommandType.PowerProfile)
    expect(queued.payload).toMatchObject({
      readIntervalMs: 600000,
      telemetryIntervalMs: 600000,
      queueIntervalMs: 600000,
    })
    expect(logArchive.recordEntry).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: 'node-001',
      source: 'command-queue',
      message: 'Power profile command queued for node-001',
    }))

    const acked = await service.acknowledgeCommand('node-001', queued.commandId, {
      result: 'completed',
    })

    expect(acked?.status).toBe('completed')
    expect(logArchive.recordEntry).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: 'node-001',
      source: 'command-queue',
      message: 'Power profile command completed for node-001',
    }))
  })

  it('rejects acknowledgements for unknown commands', async () => {
    const service = new CommandQueueService(db, saveDb, logArchive as never)

    const acked = await service.acknowledgeCommand('node-001', 'missing-command', {
      result: 'failed',
      message: 'not found',
    })

    expect(acked).toBeNull()
    expect(saveDb).not.toHaveBeenCalled()
    expect(logArchive.recordEntry).not.toHaveBeenCalled()
  })
})
