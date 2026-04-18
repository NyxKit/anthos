import { describe, expect, it, vi } from 'vitest'
import { PowerProfile } from '@anthos/shared/nodes/types/powerProfile'

import { PowerProfileController } from '../src/controllers/PowerProfileController.js'

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('PowerProfileController', () => {
  it('logs profile assignment when applying a profile', async () => {
    const registry = {
      setPowerProfileAssignment: vi.fn().mockReturnValue(true),
      getPowerProfileState: vi.fn().mockReturnValue({ nodeId: 'node-001', assignment: null, applied: null }),
    }
    const logArchive = {
      recordEntry: vi.fn().mockResolvedValue(undefined),
    }
    const commands = {
      enqueuePowerProfileCommand: vi.fn().mockResolvedValue({ commandId: 'cmd-123' }),
    }
    const controller = new PowerProfileController(registry as never, logArchive as never, commands as never, vi.fn().mockResolvedValue(undefined) as never)
    const res = createRes()

    await controller.applyProfile({
      params: { id: 'node-001' },
      body: { profileId: PowerProfile.Balanced },
    } as never, res as never)

    expect(logArchive.recordEntry).toHaveBeenCalledWith(expect.objectContaining({
      nodeId: 'node-001',
      level: 'info',
      source: 'power-profile',
    }))
    expect(registry.setPowerProfileAssignment).toHaveBeenCalled()
    expect(commands.enqueuePowerProfileCommand).toHaveBeenCalledWith('node-001', expect.objectContaining({
      readIntervalMs: 600000,
      telemetryIntervalMs: 600000,
      queueIntervalMs: 600000,
    }))
    expect(res.json).toHaveBeenCalled()
  })
})
