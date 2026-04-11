import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LogicalNodeRecord } from '@/shared/types/telemetry'
import anthos from '@anthos/shared/anthos'

export const useNodesStore = defineStore('nodes', () => {
  const nodes = ref<LogicalNodeRecord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNodes(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const data = await anthos.nodes.getAll()
      nodes.value = data.nodes
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch nodes'
    } finally {
      isLoading.value = false
    }
  }

  async function claimNode(nodeId: string, displayName: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await anthos.nodes.claim(nodeId, displayName)
      const index = nodes.value.findIndex(n => n.nodeId === nodeId)
      if (index === -1) return
      nodes.value[index] = { ...nodes.value[index], displayName: updated.displayName ?? displayName, claimStatus: 'claimed' }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to claim node'
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

  return { nodes, isLoading, error, fetchNodes, claimNode, openProvisionWindow }
})
