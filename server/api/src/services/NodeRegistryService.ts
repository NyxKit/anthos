import { randomUUID } from 'node:crypto'
import type { Database } from 'sql.js'

import type {
  LogicalNodeRecord,
  NodePowerProfileState,
  PowerProfileAssignmentState,
  PowerProfileAppliedState,
  PowerProfileDefinition,
  SoilMoistureCapability,
} from '@anthos/shared/nodes/types'
import { PowerProfile } from '@anthos/shared/nodes/types/powerProfile'
import { DEFAULT_POWER_PROFILE } from '@anthos/shared/nodes/data/powerProfiles'

export class NodeRegistryService {
  constructor(
    private readonly db: Database,
    private readonly saveDb?: () => Promise<void>
  ) {}

  async upsertHardwareNode(hwId: string, firmwareVersion = ''): Promise<void> {
    const now = Date.now()
    const hasFirmwareVersion = firmwareVersion.length > 0

    const insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO hardware_nodes (hw_id, first_seen, last_seen, firmware_version)
      VALUES (?, ?, ?, ?)
    `)
    insertStmt.run([hwId, now, now, hasFirmwareVersion ? firmwareVersion : null])
    insertStmt.free()

    if (hasFirmwareVersion) {
      const updateStmt = this.db.prepare(`
        UPDATE hardware_nodes SET last_seen=?, firmware_version=? WHERE hw_id=?
      `)
      updateStmt.run([now, firmwareVersion, hwId])
      updateStmt.free()
      await this.persist()
      return
    }

    const updateStmt = this.db.prepare(`
      UPDATE hardware_nodes SET last_seen=? WHERE hw_id=?
    `)
    updateStmt.run([now, hwId])
    updateStmt.free()
    await this.persist()
  }

  findLogicalNodeByHwId(hwId: string): LogicalNodeRecord | null {
    const stmt = this.db.prepare(`
      SELECT node_id, hw_id, display_name, node_order, capability, registered_at, power_profile_id, power_profile_assigned_at
      FROM logical_nodes WHERE hw_id=?
    `)
    stmt.bind([hwId])
    const hasRow = stmt.step()
    if (!hasRow) {
      stmt.free()
      return null
    }
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()

    if (!row['node_id']) return null

    return this.rowToRecord(row)
  }

  async createLogicalNode(hwId: string): Promise<string> {
    const now = Date.now()

    this.ensureNodeIdCounter()

    this.db.run('BEGIN IMMEDIATE TRANSACTION')
    try {
      const nextStmt = this.db.prepare(`
        SELECT next_suffix
        FROM node_id_counters
        WHERE id = 1
      `)
      nextStmt.step()
      const nextRow = nextStmt.getAsObject() as Record<string, unknown>
      nextStmt.free()

      const next = Number(nextRow['next_suffix'] ?? 1)
      const nodeId = `node-${String(next).padStart(3, '0')}`

      const bumpStmt = this.db.prepare(`
        UPDATE node_id_counters
        SET next_suffix = next_suffix + 1
        WHERE id = 1
      `)
      bumpStmt.run()
      bumpStmt.free()

      const insertStmt = this.db.prepare(`
        INSERT INTO logical_nodes (node_id, hw_id, display_name, node_order, capability, registered_at)
        VALUES (?, ?, NULL, NULL, 'earth', ?)
      `)
      insertStmt.run([nodeId, hwId, now])
      insertStmt.free()

      this.db.run('COMMIT')

      await this.persist()
      return nodeId
    } catch (error) {
      this.db.run('ROLLBACK')
      throw error
    }
  }

  listLogicalNodes(): LogicalNodeRecord[] {
    const results = this.db.exec(`
      SELECT node_id, hw_id, display_name, node_order, capability, registered_at, power_profile_id, power_profile_assigned_at
      FROM logical_nodes
      ORDER BY node_order IS NULL, node_order ASC, registered_at ASC
    `)

    if (results.length === 0) return []

    const { columns, values } = results[0]
    return values.map(row => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col, i) => { obj[col] = row[i] })
      return this.rowToRecord(obj)
    })
  }

  getLogicalNode(nodeId: string): LogicalNodeRecord | null {
    const stmt = this.db.prepare(`
      SELECT node_id, hw_id, display_name, node_order, capability, registered_at, power_profile_id, power_profile_assigned_at
      FROM logical_nodes WHERE node_id=?
    `)
    stmt.bind([nodeId])
    const hasRow = stmt.step()
    if (!hasRow) {
      stmt.free()
      return null
    }
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()

    if (!row['node_id']) return null

    return this.rowToRecord(row)
  }

  async updateCapability(nodeId: string, capability: 'earth' | 'watering'): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE logical_nodes SET capability=? WHERE node_id=?
    `)
    stmt.run([capability, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(`
      SELECT 1 FROM logical_nodes WHERE node_id=? AND capability=?
    `)
    checkStmt.bind([nodeId, capability])
    const updated = checkStmt.step()
    checkStmt.free()

    await this.persist()
    return updated
  }

  async updateDisplayName(nodeId: string, displayName: string): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE logical_nodes SET display_name=? WHERE node_id=?
    `)
    stmt.run([displayName, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(`
      SELECT 1 FROM logical_nodes WHERE node_id=? AND display_name=?
    `)
    checkStmt.bind([nodeId, displayName])
    const updated = checkStmt.step()
    checkStmt.free()

    await this.persist()
    return updated
  }

  async updateOrder(nodeId: string, order: number | null): Promise<boolean> {
    const stmt = this.db.prepare(`
      UPDATE logical_nodes SET node_order=? WHERE node_id=?
    `)
    stmt.run([order, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(`
      SELECT 1 FROM logical_nodes WHERE node_id=? AND node_order ${order === null ? 'IS NULL' : '= ?'}
    `)
    order === null ? checkStmt.bind([nodeId]) : checkStmt.bind([nodeId, order])
    const updated = checkStmt.step()
    checkStmt.free()

    await this.persist()
    return updated
  }

  getPowerProfileState(nodeId: string): NodePowerProfileState | null {
    const stmt = this.db.prepare(`
      SELECT
        node_id,
        power_profile_id,
        power_profile_read_interval_ms,
        power_profile_telemetry_interval_ms,
        power_profile_queue_interval_ms,
        power_profile_assigned_at,
        power_profile_applied_id,
        power_profile_applied_read_interval_ms,
        power_profile_applied_telemetry_interval_ms,
        power_profile_applied_queue_interval_ms,
        power_profile_applied_at
      FROM logical_nodes WHERE node_id=?
    `)
    stmt.bind([nodeId])
    const hasRow = stmt.step()
    if (!hasRow) {
      stmt.free()
      return null
    }

    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()

    return this.rowToPowerProfileState(row)
  }

  setPowerProfileAssignment(nodeId: string, profile: PowerProfileDefinition, updatedAt = Date.now()): boolean {
    const stmt = this.db.prepare(`
      UPDATE logical_nodes SET
        power_profile_id=?,
        power_profile_read_interval_ms=?,
        power_profile_telemetry_interval_ms=?,
        power_profile_queue_interval_ms=?,
        power_profile_assigned_at=?
      WHERE node_id=?
    `)
    stmt.run([profile.id, profile.intervalMs, profile.intervalMs, profile.intervalMs, updatedAt, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(`
      SELECT 1 FROM logical_nodes
      WHERE node_id=? AND power_profile_id=?
        AND power_profile_read_interval_ms=? AND power_profile_telemetry_interval_ms=? AND power_profile_queue_interval_ms=?
    `)
    checkStmt.bind([nodeId, profile.id, profile.intervalMs, profile.intervalMs, profile.intervalMs])
    const updated = checkStmt.step()
    checkStmt.free()

    return updated
  }

  setPowerProfileApplied(nodeId: string, profile: PowerProfileDefinition, appliedAt = Date.now()): boolean {
    const stmt = this.db.prepare(`
      UPDATE logical_nodes SET
        power_profile_applied_id=?,
        power_profile_applied_read_interval_ms=?,
        power_profile_applied_telemetry_interval_ms=?,
        power_profile_applied_queue_interval_ms=?,
        power_profile_applied_at=?
      WHERE node_id=?
    `)
    stmt.run([profile.id, profile.intervalMs, profile.intervalMs, profile.intervalMs, appliedAt, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(`
      SELECT 1 FROM logical_nodes
      WHERE node_id=?
       AND power_profile_applied_id=? AND power_profile_applied_read_interval_ms=? AND power_profile_applied_telemetry_interval_ms=? AND power_profile_applied_queue_interval_ms=?`
    )
    checkStmt.bind([nodeId, profile.id, profile.intervalMs, profile.intervalMs, profile.intervalMs])
    const updated = checkStmt.step()
    checkStmt.free()

    return updated
  }

  async touchNodeByNodeId(nodeId: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE hardware_nodes
      SET last_seen = ?
      WHERE hw_id = (
        SELECT hw_id FROM logical_nodes WHERE node_id = ?
      )
    `)
    stmt.run([Date.now(), nodeId])
    stmt.free()
    await this.persist()
  }

  countLogicalNodes(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) AS count FROM logical_nodes')
    stmt.step()
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()
    return Number(row['count'] ?? 0)
  }

  countActiveNodes(activeWindowMs = 30000): number {
    const cutoff = Date.now() - activeWindowMs
    const stmt = this.db.prepare('SELECT COUNT(*) AS count FROM hardware_nodes WHERE last_seen >= ?')
    stmt.bind([cutoff])
    stmt.step()
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()
    return Number(row['count'] ?? 0)
  }

  getHardwareNodeFirmwareVersion(hwId: string): string | null {
    const stmt = this.db.prepare('SELECT firmware_version FROM hardware_nodes WHERE hw_id=?')
    stmt.bind([hwId])
    const hasRow = stmt.step()
    if (!hasRow) {
      stmt.free()
      return null
    }
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()

    return row['firmware_version'] != null ? String(row['firmware_version']) : null
  }

  getHardwareNodeWriteToken(hwId: string): string | null {
    const stmt = this.db.prepare('SELECT device_token FROM hardware_nodes WHERE hw_id=?')
    stmt.bind([hwId])
    const hasRow = stmt.step()
    if (!hasRow) {
      stmt.free()
      return null
    }
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()

    return row['device_token'] != null ? String(row['device_token']) : null
  }

  async ensureHardwareNodeWriteToken(hwId: string): Promise<string> {
    const current = this.getHardwareNodeWriteToken(hwId)
    if (current) return current

    const token = randomUUID()
    const stmt = this.db.prepare(`
      UPDATE hardware_nodes
      SET device_token=?
      WHERE hw_id=?
    `)
    stmt.run([token, hwId])
    stmt.free()
    await this.persist()
    return token
  }

  private async persist(): Promise<void> {
    if (!this.saveDb) return
    await this.saveDb()
  }

  private ensureNodeIdCounter(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS node_id_counters (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        next_suffix INTEGER NOT NULL
      )
    `)

    const rowStmt = this.db.prepare(`
      SELECT next_suffix
      FROM node_id_counters
      WHERE id = 1
    `)
    const hasRow = rowStmt.step()
    rowStmt.free()

    const maxStmt = this.db.prepare(`
      SELECT MAX(CAST(REPLACE(node_id, 'node-', '') AS INTEGER)) AS max_num
      FROM logical_nodes
    `)
    maxStmt.step()
    const maxRow = maxStmt.getAsObject() as Record<string, unknown>
    maxStmt.free()

    const minNextSuffix = Number(maxRow['max_num'] ?? 0) + 1

    if (!hasRow) {
      const insertStmt = this.db.prepare(`
        INSERT INTO node_id_counters (id, next_suffix)
        VALUES (1, ?)
      `)
      insertStmt.run([minNextSuffix])
      insertStmt.free()
      return
    }

    const updateStmt = this.db.prepare(`
      UPDATE node_id_counters
      SET next_suffix = CASE WHEN next_suffix < ? THEN ? ELSE next_suffix END
      WHERE id = 1
    `)
    updateStmt.run([minNextSuffix, minNextSuffix])
    updateStmt.free()
  }

  private rowToRecord(row: Record<string, unknown>): LogicalNodeRecord {
    return {
      nodeId: String(row['node_id']),
      hwId: String(row['hw_id']),
      displayName: row['display_name'] != null ? String(row['display_name']) : null,
      capability: row['capability'] as SoilMoistureCapability,
      order: row['node_order'] != null ? Number(row['node_order']) : null,
      registeredAt: Number(row['registered_at']),
      powerProfile: row['power_profile_id'] != null
        ? String(row['power_profile_id']) as LogicalNodeRecord['powerProfile']
        : DEFAULT_POWER_PROFILE,
      powerProfileAssignedAt: Number(row['power_profile_assigned_at'] ?? 0),
    }
  }

  private rowToPowerProfileState(row: Record<string, unknown>): NodePowerProfileState {
    const assignment = row['power_profile_id'] != null
      ? this.rowToAssignmentState(row)
      : null
    const applied = row['power_profile_applied_id'] != null
      ? this.rowToAppliedState(row)
      : null

    return {
      nodeId: String(row['node_id']),
      assignment,
      applied,
    }
  }

  private rowToAssignmentState(row: Record<string, unknown>): PowerProfileAssignmentState {
    return {
      profileId: String(row['power_profile_id']) as PowerProfileAssignmentState['profileId'],
      intervalMs: Number(row['power_profile_telemetry_interval_ms'] ?? row['power_profile_read_interval_ms'] ?? row['power_profile_queue_interval_ms'] ?? 0),
      updatedAt: Number(row['power_profile_assigned_at'] ?? 0),
    }
  }

  private rowToAppliedState(row: Record<string, unknown>): PowerProfileAppliedState {
    return {
      profileId: String(row['power_profile_applied_id']) as PowerProfileAppliedState['profileId'],
      intervalMs: Number(row['power_profile_applied_telemetry_interval_ms'] ?? row['power_profile_applied_read_interval_ms'] ?? row['power_profile_applied_queue_interval_ms'] ?? 0),
      appliedAt: Number(row['power_profile_applied_at'] ?? 0),
    }
  }
}
