import { describe, expect, it } from 'vitest'
import PlantNode, { OFFLINE_TELEMETRY_INTERVAL_MULTIPLIER } from '@anthos/shared/nodes/classes/PlantNode'
import { PowerProfile } from '@anthos/shared/nodes/types/powerProfile'

describe('offline telemetry threshold', () => {
  it('uses the configured multiplier', () => {
    expect(OFFLINE_TELEMETRY_INTERVAL_MULTIPLIER).toBe(3)
  })

  it('scales with the selected power profile', () => {
    const performance = new PlantNode({
      id: 'node-001',
      hwId: 'hw-001',
      capability: 'earth',
      registeredAt: 0,
      powerProfile: PowerProfile.Performance,
    })
    const balanced = new PlantNode({
      id: 'node-002',
      hwId: 'hw-002',
      capability: 'earth',
      registeredAt: 0,
      powerProfile: PowerProfile.Balanced,
    })
    const powerSaver = new PlantNode({
      id: 'node-003',
      hwId: 'hw-003',
      capability: 'earth',
      registeredAt: 0,
      powerProfile: PowerProfile.PowerSaver,
    })

    expect(performance.telemetryOfflineThresholdMs).toBe(3000)
    expect(balanced.telemetryOfflineThresholdMs).toBe(1800000)
    expect(powerSaver.telemetryOfflineThresholdMs).toBe(10800000)
  })
})
