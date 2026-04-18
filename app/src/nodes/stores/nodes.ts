import { defineStore } from 'pinia'
import { ref } from 'vue'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import anthos from '@anthos/shared/anthos'

export const useNodesStore = defineStore('nodes', () => {
  const nodes = ref<PlantNode[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function sortNodes<T extends { order: number | null; name: string; registeredAt: number }>(items: T[]): T[] {
    return [...items].sort((left, right) => {
      const leftOrder = left.order ?? Number.POSITIVE_INFINITY
      const rightOrder = right.order ?? Number.POSITIVE_INFINITY
      const orderDiff = leftOrder - rightOrder
      if (orderDiff !== 0) return orderDiff

      if (left.order === null && right.order === null) {
        const timeDiff = left.registeredAt - right.registeredAt
        if (timeDiff !== 0) return timeDiff
      }

      return left.name.localeCompare(right.name)
    })
  }

  async function fetchNodes(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const data = await anthos.nodes.getAll()
      nodes.value = sortNodes(data.nodes.map(node => new PlantNode(node)))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch nodes'
    } finally {
      isLoading.value = false
    }
  }

  async function claimNode(nodeId: string, displayName: string, capability: 'earth' | 'watering'): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await anthos.nodes.claim(nodeId, displayName, capability)
      const index = nodes.value.findIndex(n => n.id === nodeId)
      if (index === -1) return
      nodes.value[index] = new PlantNode({ ...nodes.value[index], ...updated })
      nodes.value = sortNodes(nodes.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to claim node'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateCapability(nodeId: string, capability: 'earth' | 'watering'): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await anthos.nodes.updateCapability(nodeId, capability)
      const index = nodes.value.findIndex(n => n.id === nodeId)
      if (index === -1) return
      nodes.value[index] = new PlantNode({ ...nodes.value[index], ...updated })
      nodes.value = sortNodes(nodes.value)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update node capability'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function openProvisionWindow(): Promise<void> {
    try {
      await anthos.nodes.openProvisionWindow()
    } catch (e) {
      // Non-fatal — provisioning window failure should not block navigation
      console.warn('Failed to open provision window:', e)
    }
  }

  return { nodes, isLoading, error, fetchNodes, claimNode, updateCapability, openProvisionWindow }
})
