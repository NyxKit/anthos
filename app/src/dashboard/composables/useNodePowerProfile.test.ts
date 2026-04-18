import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getPowerProfile, applyPowerProfile } = vi.hoisted(() => ({
  getPowerProfile: vi.fn(),
  applyPowerProfile: vi.fn(),
}))

vi.mock('@anthos/shared/anthos', () => ({
  default: {
    nodes: {
      getPowerProfile,
      applyPowerProfile,
    },
  },
}))

import { useNodePowerProfile } from './useNodePowerProfile'

describe('useNodePowerProfile', () => {
  beforeEach(() => {
    getPowerProfile.mockReset()
    applyPowerProfile.mockReset()
  })

  it('defaults missing profile state to performance', () => {
    const { selectedProfileId, selectedProfileLabel, selectedProfileOption } = useNodePowerProfile(() => '')

    expect(selectedProfileId.value).toBe('performance')
    expect(selectedProfileLabel.value).toBe('Performance')
    expect(selectedProfileOption.value?.value).toBe('performance')
  })
})
