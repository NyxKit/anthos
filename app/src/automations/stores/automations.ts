import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import anthos from '@anthos/shared/anthos'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { type AutomationRecord, type AutomationUpsertInput } from '@anthos/shared/automations'
import type { LatestTelemetryResponse, NodeTelemetryPayload, SensorType } from '@anthos/shared/nodes/types'

export type AutomationOption = {
  label: string
  value: string
}

export const useAutomationsStore = defineStore('automations', () => {
  const nodes = ref<PlantNode[]>([])
  const latestTelemetryByNode = ref<NodeTelemetryPayload[]>([])
  const automations = ref<AutomationRecord[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const nodeOptions = computed<AutomationOption[]>(() => nodes.value.map(node => ({ label: node.name, value: node.id })))

  function upsertAutomation(nextAutomation: AutomationRecord): void {
    const index = automations.value.findIndex(item => item.automationId === nextAutomation.automationId)
    if (index === -1) {
      automations.value = [...automations.value, nextAutomation]
      return
    }

    const next = [...automations.value]
    next[index] = nextAutomation
    automations.value = next
  }

  function removeAutomation(automationId: string): void {
    automations.value = automations.value.filter(item => item.automationId !== automationId)
  }

  function normalizeTelemetry(response: LatestTelemetryResponse): NodeTelemetryPayload[] {
    return response.nodes
  }

  function sensorOptionsForNode(nodeId: string): AutomationOption[] {
    const telemetry = latestTelemetryByNode.value.find(entry => entry.nodeId === nodeId)
    if (!telemetry) return []

    const uniqueSensors = new Set<SensorType>()
    for (const sensor of telemetry.sensors) {
      uniqueSensors.add(sensor.type)
    }

    return [...uniqueSensors].map(sensorType => ({
      label: sensorType,
      value: sensorType,
    }))
  }

  async function load(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const [nodesResponse, telemetryResponse, automationsResponse] = await Promise.all([
        anthos.nodes.getAll(),
        anthos.nodes.getLatestTelemetryByNode(),
        anthos.automations.list(),
      ])

      nodes.value = nodesResponse.nodes.map(node => new PlantNode(node))
      latestTelemetryByNode.value = normalizeTelemetry(telemetryResponse)

      if (automationsResponse.isFailure) {
        throw new Error(automationsResponse.message)
      }

      automations.value = automationsResponse.value
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load automations'
    } finally {
      isLoading.value = false
    }
  }

  async function createAutomation(input: AutomationUpsertInput): Promise<AutomationRecord> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.automations.create(input)
      if (response.isFailure) {
        throw new Error(response.message)
      }

      upsertAutomation(response.value)
      return response.value
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to create automation'
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  async function updateAutomation(automationId: string, input: AutomationUpsertInput): Promise<AutomationRecord> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.automations.update(automationId, input)
      if (response.isFailure) {
        throw new Error(response.message)
      }

      upsertAutomation(response.value)
      return response.value
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to update automation'
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAutomation(automationId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.automations.delete(automationId)
      if (response.isFailure) {
        throw new Error(response.message)
      }

      removeAutomation(automationId)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to delete automation'
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  return {
    nodes,
    latestTelemetryByNode,
    automations,
    isLoading,
    error,
    nodeOptions,
    sensorOptionsForNode,
    load,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    upsertAutomation,
    removeAutomation,
  }
})
