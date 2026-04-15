import type { Database } from 'sql.js'

import type {
  LogicalNodeRecord,
  NodePowerProfileState,
  PowerProfileAssignmentState,
  PowerProfileAppliedState,
  PowerProfileDefinition,
} from '@anthos/shared'

export class NodeRegistryService {
  constructor(private readonly db: Database) {}

  upsertHardwareNode(hwId: string, firmwareVersion = ''): void {
    const now = Date.now()
    const hasFirmwareVersion = firmwareVersion.length > 0

    const insertStmt = this.db.prepare(
      'INSERT OR IGNORE INTO hardware_nodes (hw_id, first_seen, last_seen, firmware_version) VALUES (?, ?, ?, ?)'
    )
    insertStmt.run([hwId, now, now, hasFirmwareVersion ? firmwareVersion : null])
    insertStmt.free()

    if (hasFirmwareVersion) {
      const updateStmt = this.db.prepare(
        'UPDATE hardware_nodes SET last_seen=?, firmware_version=? WHERE hw_id=?'
      )
      updateStmt.run([now, firmwareVersion, hwId])
      updateStmt.free()
      return
    }

    const updateStmt = this.db.prepare('UPDATE hardware_nodes SET last_seen=? WHERE hw_id=?')
    updateStmt.run([now, hwId])
    updateStmt.free()
  }

  findLogicalNodeByHwId(hwId: string): LogicalNodeRecord | null {
    const stmt = this.db.prepare(
      'SELECT node_id, hw_id, display_name, claim_status, capability, registered_at FROM logical_nodes WHERE hw_id=?'
    )
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

  createLogicalNode(hwId: string): string {
    const now = Date.now()

    const maxStmt = this.db.prepare(
      "SELECT MAX(CAST(REPLACE(node_id,'node-','') AS INTEGER)) as max_num FROM logical_nodes"
    )
    maxStmt.step()
    const maxRow = maxStmt.getAsObject() as Record<string, unknown>
    maxStmt.free()

    const maxNum = maxRow['max_num'] != null ? Number(maxRow['max_num']) : 0
    const next = maxNum + 1
    const nodeId = `node-${String(next).padStart(3, '0')}`

    const insertStmt = this.db.prepare(
      "INSERT INTO logical_nodes (node_id, hw_id, display_name, claim_status, capability, registered_at) VALUES (?, ?, NULL, 'unclaimed', 'earth', ?)"
    )
    insertStmt.run([nodeId, hwId, now])
    insertStmt.free()

    return nodeId
  }

  listLogicalNodes(): LogicalNodeRecord[] {
    const results = this.db.exec(
      'SELECT node_id, hw_id, display_name, claim_status, capability, registered_at FROM logical_nodes ORDER BY registered_at DESC'
    )

    if (results.length === 0) return []

    const { columns, values } = results[0]
    return values.map(row => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col, i) => { obj[col] = row[i] })
      return this.rowToRecord(obj)
    })
  }

  getLogicalNode(nodeId: string): LogicalNodeRecord | null {
    const stmt = this.db.prepare(
      'SELECT node_id, hw_id, display_name, claim_status, capability, registered_at FROM logical_nodes WHERE node_id=?'
    )
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

  claimNode(nodeId: string, displayName: string, capability: 'earth' | 'watering' = 'earth'): boolean {
    const stmt = this.db.prepare(
      "UPDATE logical_nodes SET display_name=?, claim_status='claimed', capability=? WHERE node_id=? AND claim_status='unclaimed'"
    )
    stmt.run([displayName, capability, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(
      "SELECT 1 FROM logical_nodes WHERE node_id=? AND claim_status='claimed' AND display_name=? AND capability=?"
    )
    checkStmt.bind([nodeId, displayName, capability])
    const updated = checkStmt.step()
    checkStmt.free()

    return updated
  }

  updateCapability(nodeId: string, capability: 'earth' | 'watering'): boolean {
    const stmt = this.db.prepare(
      "UPDATE logical_nodes SET capability=? WHERE node_id=? AND claim_status='claimed'"
    )
    stmt.run([capability, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(
      "SELECT 1 FROM logical_nodes WHERE node_id=? AND claim_status='claimed' AND capability=?"
    )
    checkStmt.bind([nodeId, capability])
    const updated = checkStmt.step()
    checkStmt.free()

    return updated
  }

  getPowerProfileState(nodeId: string): NodePowerProfileState | null {
    const stmt = this.db.prepare(
      `SELECT
        node_id,
        power_profile_id,
        power_profile_telemetry_interval_ms,
        power_profile_queue_interval_ms,
        power_profile_assigned_at,
        power_profile_applied_id,
        power_profile_applied_telemetry_interval_ms,
        power_profile_applied_queue_interval_ms,
        power_profile_applied_at
      FROM logical_nodes WHERE node_id=?`
    )
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
    const stmt = this.db.prepare(
      `UPDATE logical_nodes SET
        power_profile_id=?,
        power_profile_telemetry_interval_ms=?,
        power_profile_queue_interval_ms=?,
        power_profile_assigned_at=?
      WHERE node_id=? AND claim_status='claimed'`
    )
    stmt.run([profile.profileId, profile.telemetryIntervalMs, profile.queueIntervalMs, updatedAt, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(
      `SELECT 1 FROM logical_nodes WHERE node_id=? AND claim_status='claimed'
       AND power_profile_id=? AND power_profile_telemetry_interval_ms=? AND power_profile_queue_interval_ms=?`
    )
    checkStmt.bind([nodeId, profile.profileId, profile.telemetryIntervalMs, profile.queueIntervalMs])
    const updated = checkStmt.step()
    checkStmt.free()

    return updated
  }

  setPowerProfileApplied(nodeId: string, profile: PowerProfileDefinition, appliedAt = Date.now()): boolean {
    const stmt = this.db.prepare(
      `UPDATE logical_nodes SET
        power_profile_applied_id=?,
        power_profile_applied_telemetry_interval_ms=?,
        power_profile_applied_queue_interval_ms=?,
        power_profile_applied_at=?
      WHERE node_id=? AND claim_status='claimed'`
    )
    stmt.run([profile.profileId, profile.telemetryIntervalMs, profile.queueIntervalMs, appliedAt, nodeId])
    stmt.free()

    const checkStmt = this.db.prepare(
      `SELECT 1 FROM logical_nodes WHERE node_id=? AND claim_status='claimed'
       AND power_profile_applied_id=? AND power_profile_applied_telemetry_interval_ms=? AND power_profile_applied_queue_interval_ms=?`
    )
    checkStmt.bind([nodeId, profile.profileId, profile.telemetryIntervalMs, profile.queueIntervalMs])
    const updated = checkStmt.step()
    checkStmt.free()

    return updated
  }

  touchNodeByNodeId(nodeId: string): void {
    const stmt = this.db.prepare(
      `
      UPDATE hardware_nodes
      SET last_seen = ?
      WHERE hw_id = (
        SELECT hw_id FROM logical_nodes WHERE node_id = ?
      )
    `
    )
    stmt.run([Date.now(), nodeId])
    stmt.free()
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
    const stmt = this.db.prepare(
      'SELECT firmware_version FROM hardware_nodes WHERE hw_id=?'
    )
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

  private rowToRecord(row: Record<string, unknown>): LogicalNodeRecord {
    return {
      nodeId: String(row['node_id']),
      hwId: String(row['hw_id']),
      displayName: row['display_name'] != null ? String(row['display_name']) : null,
      claimStatus: row['claim_status'] as 'unclaimed' | 'claimed',
      capability: row['capability'] === 'watering' ? 'watering' : 'earth',
      registeredAt: Number(row['registered_at']),
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
      telemetryIntervalMs: Number(row['power_profile_telemetry_interval_ms'] ?? 0),
      queueIntervalMs: Number(row['power_profile_queue_interval_ms'] ?? 0),
      updatedAt: Number(row['power_profile_assigned_at'] ?? 0),
    }
  }

  private rowToAppliedState(row: Record<string, unknown>): PowerProfileAppliedState {
    return {
      profileId: String(row['power_profile_applied_id']) as PowerProfileAppliedState['profileId'],
      telemetryIntervalMs: Number(row['power_profile_applied_telemetry_interval_ms'] ?? 0),
      queueIntervalMs: Number(row['power_profile_applied_queue_interval_ms'] ?? 0),
      appliedAt: Number(row['power_profile_applied_at'] ?? 0),
    }
  }
}
