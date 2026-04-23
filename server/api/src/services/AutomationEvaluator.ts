import type { Database } from 'sql.js'

import { AutomationComparisonOperator, type AutomationRecord } from '@anthos/shared/automations'
import type { NodeTelemetryPayload } from '@anthos/shared/nodes/types'

import type { LogArchiveService } from './LogArchiveService.js'
import { NodeRegistryService } from './NodeRegistryService.js'
import { CommandQueueService } from './CommandQueueService.js'
import { AutomationService } from './AutomationService.js'

type ReadingRow = Record<string, unknown>

const COOLDOWN_MS = 30 * 60 * 1000

export class AutomationEvaluator {
  constructor(
    private readonly db: Database,
    private readonly registry: NodeRegistryService,
    private readonly commands: CommandQueueService,
    private readonly automations: AutomationService,
    private readonly logArchive: LogArchiveService,
  ) {}

  async evaluateTelemetry(payload: NodeTelemetryPayload): Promise<number> {
    let triggered = 0

    for (const sensor of payload.sensors) {
      const automations = this.automations.listEnabledForNodeSensor(payload.nodeId, sensor.type)
      if (automations.length === 0) continue

      const previousReading = this.getPreviousReading(payload.nodeId, sensor.type, payload.timestampMs)
      for (const automation of automations) {
        if (!this.matchesTransition(automation, previousReading?.value ?? null, sensor.value)) continue
        if (!this.isCooldownComplete(automation, payload.timestampMs)) continue

        const node = this.registry.getLogicalNode(payload.nodeId)
        if (!node || node.capability !== 'watering') {
          await this.logArchive.recordEntry({
            nodeId: payload.nodeId,
            level: 'warn',
            source: 'automations',
            message: `Automation skipped for ${payload.nodeId}`,
            meta: {
              automationId: automation.automationId,
              reason: 'node_not_watering',
            },
          })
          continue
        }

        const volumeMl = Number((automation.command as Record<string, unknown>).volumeMl)
        if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
          await this.logArchive.recordEntry({
            nodeId: payload.nodeId,
            level: 'warn',
            source: 'automations',
            message: `Automation rejected for ${payload.nodeId}`,
            meta: {
              automationId: automation.automationId,
              reason: 'invalid_command_payload',
            },
          })
          continue
        }

        const queued = await this.commands.enqueuePumpCommand(payload.nodeId, { volumeMl })
        await this.automations.markTriggered(automation.automationId, payload.timestampMs)

        await this.logArchive.recordEntry({
          nodeId: payload.nodeId,
          level: 'info',
          source: 'automations',
          message: `Automation triggered for ${payload.nodeId}`,
          meta: {
            automationId: automation.automationId,
            commandId: queued.commandId,
            sensorType: sensor.type,
            currentValue: sensor.value,
            previousValue: previousReading?.value ?? null,
            commandType: automation.commandType,
            command: automation.command,
          },
        })

        triggered += 1
      }
    }

    return triggered
  }

  private matchesTransition(automation: AutomationRecord, previousValue: number | null, currentValue: number): boolean {
    if (previousValue == null) return false

    switch (automation.operator) {
      case AutomationComparisonOperator.LessThan:
        return previousValue >= automation.thresholdValue && currentValue < automation.thresholdValue
      case AutomationComparisonOperator.GreaterThan:
        return previousValue <= automation.thresholdValue && currentValue > automation.thresholdValue
      case AutomationComparisonOperator.Equal:
        return previousValue !== automation.thresholdValue && currentValue === automation.thresholdValue
      default:
        return false
    }
  }

  private isCooldownComplete(automation: AutomationRecord, timestamp: number): boolean {
    if (automation.lastTriggeredAt == null) return true
    return timestamp - automation.lastTriggeredAt >= COOLDOWN_MS
  }

  private getPreviousReading(nodeId: string, sensorType: string, beforeTimestamp: number): { value: number; timestamp: number } | null {
    const stmt = this.db.prepare(`
      SELECT value, timestamp
      FROM readings
      WHERE node_id = ? AND sensor_type = ? AND timestamp < ?
      ORDER BY timestamp DESC, id DESC
      LIMIT 1
    `)
    stmt.bind([nodeId, sensorType, beforeTimestamp])

    if (!stmt.step()) {
      stmt.free()
      return null
    }

    const row = stmt.getAsObject() as ReadingRow
    stmt.free()

    return {
      value: Number(row['value']),
      timestamp: Number(row['timestamp']),
    }
  }
}
