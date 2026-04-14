import { beforeEach, describe, expect, it, vi } from 'vitest'
import initSqlJs, { Database } from 'sql.js'

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

  beforeEach(async () => {
    db = await createDb()
    saveDb = vi.fn().mockResolvedValue(undefined)
  })

  it('queues commands, returns pending commands, and acknowledges them', async () => {
    const service = new CommandQueueService(db, saveDb)

    const queued = await service.enqueuePumpCommand('node-001', { durationMs: 1500 })
    expect(queued.nodeId).toBe('node-001')
    expect(queued.type).toBe('pump')
    expect(queued.status).toBe('pending')
    expect(saveDb).toHaveBeenCalledTimes(1)

    const pending = service.getPendingCommands('node-001')
    expect(pending.nodeId).toBe('node-001')
    expect(pending.commands).toHaveLength(1)
    expect(pending.commands[0]?.payload.durationMs).toBe(1500)

    const acked = await service.acknowledgeCommand('node-001', queued.commandId, {
      result: 'completed',
    })

    expect(acked?.status).toBe('completed')
    expect(saveDb).toHaveBeenCalledTimes(2)
    expect(service.getPendingCommands('node-001').commands).toHaveLength(0)
  })

  it('rejects acknowledgements for unknown commands', async () => {
    const service = new CommandQueueService(db, saveDb)

    const acked = await service.acknowledgeCommand('node-001', 'missing-command', {
      result: 'failed',
      message: 'not found',
    })

    expect(acked).toBeNull()
    expect(saveDb).not.toHaveBeenCalled()
  })
})
