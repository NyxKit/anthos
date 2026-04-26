import { describe, expect, it } from 'vitest'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { DEFAULT_POWER_PROFILE } from '@anthos/shared/nodes/data/powerProfiles'
import { PowerProfile } from '@anthos/shared/nodes/types/powerProfile'

describe('default power profile', () => {
  it('defaults to performance for new app-side nodes', () => {
    expect(DEFAULT_POWER_PROFILE).toBe(PowerProfile.Performance)

    const node = new PlantNode({
      id: 'node-001',
      hwId: 'hw-001',
      capability: 'earth',
      registeredAt: 0,
    })

    expect(node.powerProfile).toBe(PowerProfile.Performance)
  })
})
