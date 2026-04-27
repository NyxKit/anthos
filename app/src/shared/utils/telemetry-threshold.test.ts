import { describe, expect, it, vi } from 'vitest'
import PlantNode, { OFFLINE_TELEMETRY_INTERVAL_MULTIPLIER } from '@anthos/shared/nodes/classes/PlantNode'
import { NodeStatus } from '@anthos/shared/nodes/types/plantNode'
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

  it('restarts the quiet window when a profile is reassigned', () => {
    const now = 1_000_000
    const recentlyReassigned = new PlantNode({
      id: 'node-004',
      hwId: 'hw-004',
      capability: 'earth',
      registeredAt: now - 10_000,
      powerProfile: PowerProfile.Performance,
      powerProfileAssignedAt: now - 500,
    })
    const expiredReassignment = new PlantNode({
      id: 'node-005',
      hwId: 'hw-005',
      capability: 'earth',
      registeredAt: now - 10_000,
      powerProfile: PowerProfile.Performance,
      powerProfileAssignedAt: now - 5_000,
    })

    vi.useFakeTimers()
    vi.setSystemTime(now)

    try {
      expect(recentlyReassigned.getStatus(now - 2_000)).toBe(NodeStatus.Connected)
      expect(expiredReassignment.getStatus(now - 5_000)).toBe(NodeStatus.Error)
    } finally {
      vi.useRealTimers()
    }
  })
})
