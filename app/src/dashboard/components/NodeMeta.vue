<script setup lang="ts">
import { computed } from 'vue'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import type { LogicalNodeRecord } from '@anthos/shared/nodes/types'
import { useNodePowerProfile } from '@/dashboard/composables/useNodePowerProfile'

const node = defineModel<LogicalNodeRecord | undefined>()

const telemetryStore = useTelemetryStore()

const nodeTelemetry = computed(() => {
  return node.value?.nodeId ? telemetryStore.getNodeTelemetry(node.value.nodeId) : null
})

const nodeId = computed(() => node.value?.nodeId ?? '--')
const nodeIdValue = computed(() => node.value?.nodeId ?? '')
const hardwareId = computed(() => node.value?.hwId ?? '--')
const ipAddress = computed(() => nodeTelemetry.value?.health.ip || '192.168.1.x')
const isLiveNode = computed(() => Boolean(nodeIdValue.value) && telemetryStore.isNodeOnline(nodeIdValue.value))

const { selectedProfileLabel } = useNodePowerProfile(nodeIdValue)

const formattedUptime = computed(() => {
  if (!isLiveNode.value) return '-'
  if (!nodeTelemetry.value?.health.uptimeMs) return '-'
  const hours = Math.floor(nodeTelemetry.value.health.uptimeMs / 3600000)
  const mins = Math.floor((nodeTelemetry.value.health.uptimeMs % 3600000) / 60000)
  return `${hours}h ${mins}m`
})

const updatedAt = computed(() => {
  if (!isLiveNode.value) return 'offline'

  const now = Date.now()
  const ts = nodeTelemetry.value?.timestampMs ?? 0
  const diff = now - ts
  const seconds = Math.floor(diff / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
})
</script>

<template>
  <div class="node-meta">
    <div class="node-meta__row">
      <span>PRESSURE</span>
      <span>1013.25 PA</span>
    </div>
    <div class="node-meta__row">
      <span>IP ADDRESS</span>
      <span>{{ ipAddress }}</span>
    </div>
    <div class="node-meta__row">
      <span>NODE ID</span>
      <span>{{ nodeId }}</span>
    </div>
    <div class="node-meta__row">
      <span>HARDWARE ID</span>
      <span>{{ hardwareId }}</span>
    </div>
    <div class="node-meta__row">
      <span>POWER PROFILE</span>
      <span>{{ selectedProfileLabel }}</span>
    </div>
    <div class="node-meta__row">
      <span>UPTIME</span>
      <span>{{ formattedUptime }}</span>
    </div>
    <div class="node-meta__bottom">
      <div class="node-meta__rssi">
        <span>RSSI: {{ nodeTelemetry?.health?.rssi ?? '--' }}dBm</span>
      </div>
      <span class="node-meta__updated">Updated {{ updatedAt }}</span>
    </div>
  </div>
</template>

<style scoped>
.node-meta {
  padding: 1rem;
  background: var(--nyx-c-surface-container-lowest, #0a0f14);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-meta__row {
  display: flex;
  justify-content: space-between;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
}

.node-meta__row span:first-child {
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
}

.node-meta__row span:last-child {
  color: var(--nyx-c-on-surface, #dee3eb);
}

.node-meta__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-meta__rssi {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
}

.node-meta__updated {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.5625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.3));
  font-style: italic;
  text-transform: uppercase;
}
</style>
