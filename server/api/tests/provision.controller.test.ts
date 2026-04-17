import { describe, expect, it, vi } from 'vitest'

import { ProvisionController } from '../src/controllers/ProvisionController.js'

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('ProvisionController', () => {
  it('stores the selected hardware capability when claiming a node', async () => {
    const registry = {
      claimNode: vi.fn().mockReturnValue(true),
    }
    const pairing = {
      isOpen: vi.fn().mockReturnValue(true),
      open: vi.fn(),
      getStatus: vi.fn(),
    }
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const controller = new ProvisionController(registry as never, pairing as never, saveDb)
    const res = createRes()

    await controller.claimNode({ params: { id: 'node-001' }, body: { displayName: 'Fern', capability: 'watering' } } as never, res as never)

    expect(registry.claimNode).toHaveBeenCalledWith('node-001', 'Fern', 'watering')
    expect(res.json).toHaveBeenCalledWith({
      nodeId: 'node-001',
      displayName: 'Fern',
      claimStatus: 'claimed',
      capability: 'watering',
    })
  })

  it('updates capability only from the nodes page path', async () => {
    const registry = {
      updateCapability: vi.fn().mockReturnValue(true),
    }
    const pairing = {
      isOpen: vi.fn().mockReturnValue(true),
      open: vi.fn(),
      getStatus: vi.fn(),
    }
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const controller = new ProvisionController(registry as never, pairing as never, saveDb)
    const res = createRes()

    await controller.updateCapability({ params: { id: 'node-001' }, body: { capability: 'watering' } } as never, res as never)

    expect(registry.updateCapability).toHaveBeenCalledWith('node-001', 'watering')
    expect(res.json).toHaveBeenCalledWith({ nodeId: 'node-001', capability: 'watering' })
  })

  it('renames a claimed node', async () => {
    const registry = {
      updateDisplayName: vi.fn().mockReturnValue(true),
    }
    const pairing = {
      isOpen: vi.fn().mockReturnValue(true),
      open: vi.fn(),
      getStatus: vi.fn(),
    }
    const saveDb = vi.fn().mockResolvedValue(undefined)
    const controller = new ProvisionController(registry as never, pairing as never, saveDb)
    const res = createRes()

    await controller.updateDisplayName({ params: { id: 'node-001' }, body: { displayName: 'Fern v2' } } as never, res as never)

    expect(registry.updateDisplayName).toHaveBeenCalledWith('node-001', 'Fern v2')
    expect(res.json).toHaveBeenCalledWith({ nodeId: 'node-001', displayName: 'Fern v2' })
  })
})
