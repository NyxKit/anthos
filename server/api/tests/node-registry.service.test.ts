import { describe, expect, it, vi } from 'vitest'
import initSqlJs, { type Database } from 'sql.js'

import { NodeRegistryService } from '../src/services/NodeRegistryService.js'

async function createDb(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE logical_nodes (
      node_id TEXT PRIMARY KEY,
      hw_id TEXT NOT NULL,
      display_name TEXT,
      node_order INTEGER,
      capability TEXT NOT NULL,
      registered_at INTEGER NOT NULL,
      power_profile_id TEXT,
      power_profile_read_interval_ms INTEGER,
      power_profile_telemetry_interval_ms INTEGER,
      power_profile_queue_interval_ms INTEGER,
      power_profile_assigned_at INTEGER,
      power_profile_applied_id TEXT,
      power_profile_applied_read_interval_ms INTEGER,
      power_profile_applied_telemetry_interval_ms INTEGER,
      power_profile_applied_queue_interval_ms INTEGER,
      power_profile_applied_at INTEGER
    )
  `)

  return db
}

describe('NodeRegistryService', () => {
  it('defaults new logical nodes to performance power profile', async () => {
    const db = await createDb()
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const registry = new NodeRegistryService(db, saveDb)

    const nodeId = await registry.createLogicalNode('hw-001')
    const node = registry.getLogicalNode(nodeId)

    expect(node?.powerProfile).toBe('performance')
    expect(saveDb).toHaveBeenCalled()
  })

  it('allocates the next logical node id after existing nodes', async () => {
    const db = await createDb()
    db.run(`
      CREATE TABLE hardware_nodes (
        hw_id TEXT PRIMARY KEY,
        first_seen INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        firmware_version TEXT,
        device_token TEXT
      )
    `)
    db.run(`
      INSERT INTO hardware_nodes (hw_id, first_seen, last_seen)
      VALUES ('hw-009', 1, 1)
    `)
    db.run(`
      INSERT INTO logical_nodes (node_id, hw_id, display_name, node_order, capability, registered_at)
      VALUES ('node-009', 'hw-009', NULL, NULL, 'earth', 1)
    `)

    const registry = new NodeRegistryService(db)
    const nodeId = await registry.createLogicalNode('hw-010')

    expect(nodeId).toBe('node-010')
  })
})
