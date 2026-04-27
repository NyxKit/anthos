import { describe, expect, it, vi } from 'vitest'
import initSqlJs, { type Database } from 'sql.js'

import { AutomationComparisonOperator, AutomationCommandType } from '@anthos/shared/automations'

import { AutomationEvaluator } from '../src/services/AutomationEvaluator.js'

async function createDb(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      sensor_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL
    )
  `)

  return db
}

describe('AutomationEvaluator', () => {
  it('queues a pump command when a reading crosses the threshold', async () => {
    const db = await createDb()
    db.run(`
      INSERT INTO readings (node_id, timestamp, sensor_type, value, unit)
      VALUES ('node-001', 1000, 'moisture', 65, 'raw')
    `)

    const automation = {
      automationId: 'automation-1',
      nodeId: 'node-001',
      sensorType: 'moisture',
      operator: AutomationComparisonOperator.LessThan,
      thresholdValue: 50,
      commandType: AutomationCommandType.Water,
      command: { commandType: AutomationCommandType.Water, volumeMl: 120 },
      enabled: true,
      lastTriggeredAt: null,
      createdAt: 1000,
      updatedAt: 1000,
    }

    const registry = {
      getLogicalNode: vi.fn().mockReturnValue({ nodeId: 'node-001', capability: 'watering' }),
    }
    const commands = {
      enqueuePumpCommand: vi.fn().mockResolvedValue({ commandId: 'cmd-123' }),
    }
    const automations = {
      listEnabledForNodeSensor: vi.fn().mockReturnValue([automation]),
      markTriggered: vi.fn().mockResolvedValue({ ...automation, lastTriggeredAt: 2000 }),
    }
    const logArchive = {
      recordEntry: vi.fn().mockResolvedValue(undefined),
    }
    const evaluator = new AutomationEvaluator(db, registry as never, commands as never, automations as never, logArchive as never)

    const triggered = await evaluator.evaluateTelemetry({
      nodeId: 'node-001',
      hwId: 'hw-001',
      timestampMs: 2000,
      capability: 'watering',
      sensors: [{ type: 'moisture', value: 40, unit: 'raw' }],
      health: { uptimeMs: 1000 },
    })

    expect(triggered).toBe(1)
    expect(commands.enqueuePumpCommand).toHaveBeenCalledWith('node-001', { volumeMl: 120 })
    expect(automations.markTriggered).toHaveBeenCalledWith('automation-1', 2000)
    expect(logArchive.recordEntry).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: 'node-001',
      source: 'automations',
      level: 'info',
    }))
  })

  it('skips automations on non-watering nodes', async () => {
    const db = await createDb()
    db.run(`
      INSERT INTO readings (node_id, timestamp, sensor_type, value, unit)
      VALUES ('node-001', 1000, 'moisture', 65, 'raw')
    `)

    const automation = {
      automationId: 'automation-1',
      nodeId: 'node-001',
      sensorType: 'moisture',
      operator: AutomationComparisonOperator.LessThan,
      thresholdValue: 50,
      commandType: AutomationCommandType.Water,
      command: { commandType: AutomationCommandType.Water, volumeMl: 120 },
      enabled: true,
      lastTriggeredAt: null,
      createdAt: 1000,
      updatedAt: 1000,
    }

    const registry = {
      getLogicalNode: vi.fn().mockReturnValue({ nodeId: 'node-001', capability: 'earth' }),
    }
    const commands = {
      enqueuePumpCommand: vi.fn(),
    }
    const automations = {
      listEnabledForNodeSensor: vi.fn().mockReturnValue([automation]),
      markTriggered: vi.fn(),
    }
    const logArchive = {
      recordEntry: vi.fn().mockResolvedValue(undefined),
    }
    const evaluator = new AutomationEvaluator(db, registry as never, commands as never, automations as never, logArchive as never)

    const triggered = await evaluator.evaluateTelemetry({
      nodeId: 'node-001',
      hwId: 'hw-001',
      timestampMs: 2000,
      capability: 'earth',
      sensors: [{ type: 'moisture', value: 40, unit: 'raw' }],
      health: { uptimeMs: 1000 },
    })

    expect(triggered).toBe(0)
    expect(commands.enqueuePumpCommand).not.toHaveBeenCalled()
    expect(automations.markTriggered).not.toHaveBeenCalled()
    expect(logArchive.recordEntry).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: 'node-001',
      source: 'automations',
      level: 'warn',
    }))
  })
})
