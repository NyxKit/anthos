import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TelemetryPayload, NodeHealthPayload, SensorSample } from '@/shared/types/telemetry'
import type { DashboardMetrics } from '@anthos/shared'
import anthos from '@anthos/shared/anthos'

interface Node {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'unknown'
  lastSeen: number
}

export const useTelemetryStore = defineStore('telemetry', () => {
  const nodeId = ref<string>('')
  const nodeName = ref<string>('')
  const status = ref<'connected' | 'disconnected' | 'unknown'>('unknown')
  const health = ref<NodeHealthPayload | null>(null)
  const sensors = ref<SensorSample[]>([])
  const timestampMs = ref<number | null>(null)
  const metrics = ref<DashboardMetrics | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<number | null>(null)

  const node = computed<Node | null>(() => {
    if (!nodeId.value) return null
    return {
      id: nodeId.value,
      name: nodeName.value,
      status: status.value,
      lastSeen: timestampMs.value || 0
    }
  })

  let pollingInterval: ReturnType<typeof setInterval> | null = null

  async function fetchData() {
    isLoading.value = true
    error.value = null

    try {
      const data: TelemetryPayload = await anthos.nodes.getLatestTelemetry()
      nodeId.value = data.nodeId
      nodeName.value = data.nodeId
      status.value = 'connected'
      health.value = data.health
      sensors.value = data.sensors
      timestampMs.value = data.timestampMs
      lastUpdated.value = Date.now()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch readings'
      if (health.value === null) {
        status.value = 'disconnected'
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMetrics() {
    try {
      metrics.value = await anthos.metrics.getDashboard()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch dashboard metrics'
    }
  }

  function startPolling(intervalMs = 5000) {
    stopPolling()
    void fetchData()
    void fetchMetrics()
    pollingInterval = setInterval(() => {
      void fetchData()
      void fetchMetrics()
    }, intervalMs)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  return {
    nodeId,
    node,
    health,
    sensors,
    timestampMs,
    metrics,
    status,
    isLoading,
    error,
    lastUpdated,
    fetchData,
    fetchMetrics,
    startPolling,
    stopPolling,
  }
})
