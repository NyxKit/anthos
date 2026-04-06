import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ofetch } from 'ofetch'
import type { LogicalNodeRecord } from '@/shared/types/telemetry'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8088'

export const useNodesStore = defineStore('nodes', () => {
  const nodes = ref<LogicalNodeRecord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNodes(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const data = await ofetch<{ nodes: LogicalNodeRecord[] }>('/api/nodes', {
        baseURL: API_BASE,
      })
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
      const updated = await ofetch<LogicalNodeRecord>(`/api/nodes/${nodeId}`, {
        baseURL: API_BASE,
        method: 'PATCH',
        body: { displayName },
      })
      const index = nodes.value.findIndex(n => n.nodeId === nodeId)
      if (index !== -1) {
        nodes.value[index] = { ...nodes.value[index], displayName: updated.displayName ?? displayName, claimStatus: 'claimed' }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to claim node'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function openProvisionWindow(): Promise<void> {
    try {
      await ofetch('/api/provision/open', {
        baseURL: API_BASE,
        method: 'POST',
      })
    } catch (e) {
      // Non-fatal — provisioning window failure should not block navigation
      console.warn('Failed to open provision window:', e)
    }
  }

  return { nodes, isLoading, error, fetchNodes, claimNode, openProvisionWindow }
})
