import { describe, expect, it, vi } from 'vitest'

import { ProvisionController } from '../src/controllers/ProvisionController.js'

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('ProvisionController', () => {
  it('updates capability directly for a node', async () => {
    const registry = {
      updateCapability: vi.fn().mockReturnValue(true),
      getLogicalNode: vi.fn().mockReturnValue({
        nodeId: 'node-001',
        hwId: 'hw-001',
        displayName: 'Fern',
        capability: 'watering',
        registeredAt: 1000,
      }),
    }
    const pairing = {
      isOpen: vi.fn().mockReturnValue(true),
      open: vi.fn(),
      getStatus: vi.fn(),
    }
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const auth = {
      requireActionUser: vi.fn().mockResolvedValue({}),
    }
    const controller = new ProvisionController(registry as never, pairing as never, auth as never, saveDb)
    const res = createRes()

    await controller.updateCapability({ params: { id: 'node-001' }, body: { capability: 'watering' }, headers: { authorization: 'Bearer token' } } as never, res as never)

    expect(registry.updateCapability).toHaveBeenCalledWith('node-001', 'watering')
    expect(res.json).toHaveBeenCalledWith({
      nodeId: 'node-001',
      hwId: 'hw-001',
      displayName: 'Fern',
      capability: 'watering',
      registeredAt: 1000,
    })
  })

  it('updates capability only from the nodes page path', async () => {
    const registry = {
      updateCapability: vi.fn().mockReturnValue(true),
      getLogicalNode: vi.fn().mockReturnValue({
        nodeId: 'node-001',
        hwId: 'hw-001',
        displayName: 'Fern',
        capability: 'watering',
        registeredAt: 1000,
      }),
    }
    const pairing = {
      isOpen: vi.fn().mockReturnValue(true),
      open: vi.fn(),
      getStatus: vi.fn(),
    }
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const auth = {
      requireActionUser: vi.fn().mockResolvedValue({}),
    }
    const controller = new ProvisionController(registry as never, pairing as never, auth as never, saveDb)
    const res = createRes()

    await controller.updateCapability({ params: { id: 'node-001' }, body: { capability: 'watering' }, headers: { authorization: 'Bearer token' } } as never, res as never)

    expect(registry.updateCapability).toHaveBeenCalledWith('node-001', 'watering')
    expect(res.json).toHaveBeenCalledWith({
      nodeId: 'node-001',
      hwId: 'hw-001',
      displayName: 'Fern',
      capability: 'watering',
      registeredAt: 1000,
    })
  })

  it('renames a node directly', async () => {
    const registry = {
      updateDisplayName: vi.fn().mockReturnValue(true),
      getLogicalNode: vi.fn().mockReturnValue({
        nodeId: 'node-001',
        hwId: 'hw-001',
        displayName: 'Fern v2',
        capability: 'earth',
        registeredAt: 1000,
      }),
    }
    const pairing = {
      isOpen: vi.fn().mockReturnValue(true),
      open: vi.fn(),
      getStatus: vi.fn(),
    }
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const auth = {
      requireActionUser: vi.fn().mockResolvedValue({}),
    }
    const controller = new ProvisionController(registry as never, pairing as never, auth as never, saveDb)
    const res = createRes()

    await controller.updateDisplayName({ params: { id: 'node-001' }, body: { displayName: 'Fern v2' }, headers: { authorization: 'Bearer token' } } as never, res as never)

    expect(registry.updateDisplayName).toHaveBeenCalledWith('node-001', 'Fern v2')
    expect(res.json).toHaveBeenCalledWith({
      nodeId: 'node-001',
      hwId: 'hw-001',
      displayName: 'Fern v2',
      capability: 'earth',
      registeredAt: 1000,
    })
  })

  it('issues a device token during registration', async () => {
    const registry = {
      upsertHardwareNode: vi.fn(),
      ensureHardwareNodeWriteToken: vi.fn().mockReturnValue('token-123'),
      findLogicalNodeByHwId: vi.fn().mockReturnValue(null),
      createLogicalNode: vi.fn().mockReturnValue('node-001'),
      getLogicalNode: vi.fn().mockReturnValue({
        nodeId: 'node-001',
        hwId: 'hw-001',
        displayName: null,
        capability: 'earth',
        registeredAt: 1000,
      }),
    }
    const pairing = {
      isOpen: vi.fn().mockReturnValue(true),
      open: vi.fn(),
      getStatus: vi.fn(),
    }
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const auth = {
      requireActionUser: vi.fn().mockResolvedValue({}),
    }
    const controller = new ProvisionController(registry as never, pairing as never, auth as never, saveDb)
    const res = createRes()

    await controller.register({ body: { hwId: 'hw-001', firmwareVersion: '1.0.0' } } as never, res as never)

    expect(registry.ensureHardwareNodeWriteToken).toHaveBeenCalledWith('hw-001')
    expect(registry.createLogicalNode).toHaveBeenCalledWith('hw-001')
    expect(saveDb).toHaveBeenCalled()
    expect(res.json).toHaveBeenCalledWith({
      nodeId: 'node-001',
      status: 'registered',
      capability: 'earth',
      deviceToken: 'token-123',
    })
  })
})
