import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'

const deleteLogicalNode = vi.hoisted(() => vi.fn())

vi.mock('@anthos/shared/anthos', () => ({
  default: {
    nodes: {
      getAll: vi.fn(),
      updateDisplayName: vi.fn(),
      updateCapability: vi.fn(),
      updateOrder: vi.fn(),
      openProvisionWindow: vi.fn(),
      deleteLogicalNode,
    },
  },
}))

import { useNodesStore } from './nodes'

describe('useNodesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    deleteLogicalNode.mockReset()
    deleteLogicalNode.mockResolvedValue(undefined)
  })

  it('removes a deleted node from local state after the API confirms deletion', async () => {
    const store = useNodesStore()
    store.nodes = [
      new PlantNode({ nodeId: 'node-001', id: 'node-001', hwId: 'hw-001', registeredAt: 1, capability: 'earth' }),
      new PlantNode({ nodeId: 'node-002', id: 'node-002', hwId: 'hw-002', registeredAt: 2, capability: 'earth' }),
    ]

    await store.deleteNode('node-001')

    expect(deleteLogicalNode).toHaveBeenCalledWith('node-001')
    expect(store.nodes.map(node => node.id)).toEqual(['node-002'])
  })
})
