import { describe, expect, it } from 'vitest'
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
    const registry = new NodeRegistryService(db)

    const nodeId = registry.createLogicalNode('hw-001')
    const node = registry.getLogicalNode(nodeId)

    expect(node?.powerProfile).toBe('performance')
  })
})
