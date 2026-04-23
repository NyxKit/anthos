import type { Database } from 'sql.js'
import { randomUUID } from 'node:crypto'

import { type AutomationCommand, type AutomationRecord, type AutomationUpsertInput } from '@anthos/shared/automations'
import { AutomationCommandType, AutomationComparisonOperator } from '@anthos/shared/automations'
import type { SensorType } from '@anthos/shared/nodes/types'

import type { LogArchiveService } from './LogArchiveService.js'
import { NodeRegistryService } from './NodeRegistryService.js'

type AutomationRow = Record<string, unknown>

export class AutomationService {
  constructor(
    private readonly db: Database,
    private readonly saveDb: () => Promise<void>,
    private readonly logArchive: LogArchiveService,
    private readonly registry: NodeRegistryService,
  ) {}

  list(): AutomationRecord[] {
    const stmt = this.db.prepare(`
      SELECT automation_id, node_id, sensor_type, operator, threshold_value, command_type, command_json, enabled, last_triggered_at, created_at, updated_at
      FROM automations
      ORDER BY updated_at DESC, created_at DESC
    `)

    const automations: AutomationRecord[] = []
    while (stmt.step()) {
      automations.push(this.rowToRecord(stmt.getAsObject() as AutomationRow))
    }

    stmt.free()
    return automations
  }

  get(automationId: string): AutomationRecord | null {
    const stmt = this.db.prepare(`
      SELECT automation_id, node_id, sensor_type, operator, threshold_value, command_type, command_json, enabled, last_triggered_at, created_at, updated_at
      FROM automations
      WHERE automation_id = ?
    `)
    stmt.bind([automationId])

    if (!stmt.step()) {
      stmt.free()
      return null
    }

    const record = this.rowToRecord(stmt.getAsObject() as AutomationRow)
    stmt.free()
    return record
  }

  listEnabledForNodeSensor(nodeId: string, sensorType: SensorType): AutomationRecord[] {
    const stmt = this.db.prepare(`
      SELECT automation_id, node_id, sensor_type, operator, threshold_value, command_type, command_json, enabled, last_triggered_at, created_at, updated_at
      FROM automations
      WHERE node_id = ? AND sensor_type = ? AND enabled = 1
      ORDER BY updated_at DESC, created_at DESC
    `)
    stmt.bind([nodeId, sensorType])

    const automations: AutomationRecord[] = []
    while (stmt.step()) {
      automations.push(this.rowToRecord(stmt.getAsObject() as AutomationRow))
    }

    stmt.free()
    return automations
  }

  async create(input: AutomationUpsertInput): Promise<AutomationRecord> {
    this.validateInput(input)
    this.assertNodeAndSensorExist(input.nodeId, input.sensorType)

    const now = Date.now()
    const automation: AutomationRecord = {
      automationId: randomUUID(),
      nodeId: input.nodeId,
      sensorType: input.sensorType,
      operator: input.operator,
      thresholdValue: input.thresholdValue,
      commandType: input.commandType,
      command: this.normalizeCommand(input.commandType, input.command),
      enabled: input.enabled ?? true,
      lastTriggeredAt: null,
      createdAt: now,
      updatedAt: now,
    }

    const stmt = this.db.prepare(`
      INSERT INTO automations (
        automation_id, node_id, sensor_type, operator, threshold_value, command_type, command_json, enabled, last_triggered_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run([
      automation.automationId,
      automation.nodeId,
      automation.sensorType,
      automation.operator,
      automation.thresholdValue,
      automation.commandType,
      JSON.stringify(automation.command),
      automation.enabled ? 1 : 0,
      automation.lastTriggeredAt,
      automation.createdAt,
      automation.updatedAt,
    ])
    stmt.free()
    await this.saveDb()

    await this.logArchive.recordEntry({
      nodeId: automation.nodeId,
      level: 'info',
      source: 'automations',
      message: `Automation created for ${automation.nodeId}`,
      meta: {
        automationId: automation.automationId,
        sensorType: automation.sensorType,
        operator: automation.operator,
        thresholdValue: automation.thresholdValue,
        commandType: automation.commandType,
        command: automation.command,
      },
    })

    return automation
  }

  async update(automationId: string, input: AutomationUpsertInput): Promise<AutomationRecord> {
    const existing = this.get(automationId)
    if (!existing) {
      throw new Error('Automation not found')
    }

    this.validateInput(input)
    this.assertNodeAndSensorExist(input.nodeId, input.sensorType)

    const updatedAt = Date.now()
    const next: AutomationRecord = {
      ...existing,
      nodeId: input.nodeId,
      sensorType: input.sensorType,
      operator: input.operator,
      thresholdValue: input.thresholdValue,
      commandType: input.commandType,
      command: this.normalizeCommand(input.commandType, input.command),
      enabled: input.enabled ?? existing.enabled,
      updatedAt,
    }

    const stmt = this.db.prepare(`
      UPDATE automations
      SET node_id = ?, sensor_type = ?, operator = ?, threshold_value = ?, command_type = ?, command_json = ?, enabled = ?, updated_at = ?
      WHERE automation_id = ?
    `)
    stmt.run([
      next.nodeId,
      next.sensorType,
      next.operator,
      next.thresholdValue,
      next.commandType,
      JSON.stringify(next.command),
      next.enabled ? 1 : 0,
      next.updatedAt,
      automationId,
    ])
    stmt.free()
    await this.saveDb()

    await this.logArchive.recordEntry({
      nodeId: next.nodeId,
      level: 'info',
      source: 'automations',
      message: `Automation updated for ${next.nodeId}`,
      meta: {
        automationId,
        sensorType: next.sensorType,
        operator: next.operator,
        thresholdValue: next.thresholdValue,
        commandType: next.commandType,
        command: next.command,
      },
    })

    return next
  }

  async delete(automationId: string): Promise<void> {
    const existing = this.get(automationId)
    if (!existing) {
      throw new Error('Automation not found')
    }

    const stmt = this.db.prepare('DELETE FROM automations WHERE automation_id = ?')
    stmt.run([automationId])
    stmt.free()
    await this.saveDb()

    await this.logArchive.recordEntry({
      nodeId: existing.nodeId,
      level: 'info',
      source: 'automations',
      message: `Automation deleted for ${existing.nodeId}`,
      meta: {
        automationId,
        sensorType: existing.sensorType,
        commandType: existing.commandType,
      },
    })
  }

  async markTriggered(automationId: string, triggeredAt: number): Promise<AutomationRecord | null> {
    const existing = this.get(automationId)
    if (!existing) return null

    const stmt = this.db.prepare(`
      UPDATE automations
      SET last_triggered_at = ?, updated_at = ?
      WHERE automation_id = ?
    `)
    stmt.run([triggeredAt, triggeredAt, automationId])
    stmt.free()
    await this.saveDb()

    return {
      ...existing,
      lastTriggeredAt: triggeredAt,
      updatedAt: triggeredAt,
    }
  }

  private validateInput(input: AutomationUpsertInput): void {
    if (!input.nodeId.trim()) throw new Error('nodeId is required')
    if (!Object.values(AutomationComparisonOperator).includes(input.operator)) throw new Error('Invalid operator')
    if (!Number.isFinite(input.thresholdValue)) throw new Error('thresholdValue must be numeric')

    if (input.commandType !== AutomationCommandType.Water) {
      throw new Error('Only watering automations are enabled for now')
    }

    if (input.command.commandType !== input.commandType) {
      throw new Error('command.commandType must match commandType')
    }

    const volumeMl = Number(input.command.volumeMl)
    if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
      throw new Error('command.volumeMl must be a positive number')
    }
  }

  private assertNodeAndSensorExist(nodeId: string, sensorType: SensorType): void {
    const node = this.registry.getLogicalNode(nodeId)
    if (!node) {
      throw new Error('Node not found')
    }

    if (!this.getNodeSensorTypes(nodeId).includes(sensorType)) {
      throw new Error('Sensor is not available for the selected node')
    }

    void node
  }

  private getNodeSensorTypes(nodeId: string): SensorType[] {
    const readingsStmt = this.db.prepare(`
      SELECT DISTINCT sensor_type
      FROM readings
      WHERE node_id = ?
      ORDER BY sensor_type ASC
    `)
    readingsStmt.bind([nodeId])

    const sensorTypes = new Set<SensorType>()
    while (readingsStmt.step()) {
      const row = readingsStmt.getAsObject() as AutomationRow
      const sensorType = String(row['sensor_type']) as SensorType
      if (sensorType) sensorTypes.add(sensorType)
    }
    readingsStmt.free()

    if (sensorTypes.size > 0) return [...sensorTypes]

    const snapshotStmt = this.db.prepare(`
      SELECT payload_json
      FROM telemetry_snapshots
      WHERE node_id = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `)
    snapshotStmt.bind([nodeId])

    if (!snapshotStmt.step()) {
      snapshotStmt.free()
      return []
    }

    const row = snapshotStmt.getAsObject() as AutomationRow
    snapshotStmt.free()

    const payloadJson = row['payload_json']
    if (typeof payloadJson !== 'string') return []

    try {
      const payload = JSON.parse(payloadJson) as { sensors?: Array<{ type?: string }> }
      return (payload.sensors ?? []).flatMap(sensor => sensor.type ? [sensor.type as SensorType] : [])
    } catch {
      return []
    }
  }

  private normalizeCommand(commandType: AutomationCommandType, command: AutomationCommand): AutomationCommand {
    return {
      ...command,
      commandType,
    }
  }

  private rowToRecord(row: AutomationRow): AutomationRecord {
    let command: AutomationCommand = { commandType: AutomationCommandType.Water }
    try {
      const parsed = JSON.parse(String(row['command_json'] ?? '{}')) as AutomationCommand
      command = {
        ...parsed,
        commandType: String(row['command_type'] ?? parsed.commandType ?? AutomationCommandType.Water) as AutomationCommandType,
      }
    } catch {
      command = {
        commandType: String(row['command_type'] ?? AutomationCommandType.Water) as AutomationCommandType,
      }
    }

    return {
      automationId: String(row['automation_id']),
      nodeId: String(row['node_id']),
      sensorType: String(row['sensor_type']) as SensorType,
      operator: String(row['operator']) as AutomationComparisonOperator,
      thresholdValue: Number(row['threshold_value']),
      commandType: String(row['command_type']) as AutomationCommandType,
      command,
      enabled: Number(row['enabled']) === 1,
      lastTriggeredAt: row['last_triggered_at'] != null ? Number(row['last_triggered_at']) : null,
      createdAt: Number(row['created_at']),
      updatedAt: Number(row['updated_at']),
    }
  }
}
