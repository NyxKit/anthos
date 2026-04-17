<script setup lang="ts">
import { computed } from 'vue'
import { NyxIcon } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import type { LogicalNodeRecord } from '@anthos/shared'

const node = defineModel<LogicalNodeRecord | undefined>()
const telemetryStore = useTelemetryStore()

const sensorConfig: Record<string, { icon: string; label: string }> = {
  lux: { icon: 'sun', label: 'Light' },
  temperature: { icon: 'thermometer', label: 'Temperature' },
  humidity: { icon: 'bubbles', label: 'Humidity' },
  moisture: { icon: 'droplets', label: 'Soil Moisture' },
}

const sensors = computed(() => {
  return Object.entries(sensorConfig).map(([type, { icon, label }]) => {
    const reading = telemetryStore.sensors.find(entry => entry.type === type)
    const isLiveNode = Boolean(node.value?.nodeId) && node.value?.nodeId === telemetryStore.nodeId && telemetryStore.status === 'connected'

    return {
      type,
      icon,
      label,
      value: isLiveNode && reading ? reading.value.toFixed(1) : '--',
      unit: isLiveNode ? reading?.unit || '' : '',
      active: Boolean(isLiveNode && reading),
    }
  })
})

const isCritical = computed(() => {
  const isLiveNode = Boolean(node.value?.nodeId) && node.value?.nodeId === telemetryStore.nodeId && telemetryStore.status === 'connected'
  if (!isLiveNode) return false
  const moisture = telemetryStore.sensors.find(reading => reading.type === 'moisture')
  return Boolean(moisture && moisture.value < 20)
})
</script>

<template>
  <div class="node-sensor-grid">
    <div v-for="sensor in sensors" :key="sensor.type" class="node-sensor-grid__sensor" :class="{ 'node-sensor-grid__sensor--critical': sensor.type === 'moisture' && isCritical }">
      <div class="node-sensor-grid__sensor-header">
        <span class="node-sensor-grid__sensor-label">{{ sensor.label.toUpperCase() }}</span>
        <NyxIcon :name="sensor.icon" :size="NyxSize.Small" class="node-sensor-grid__sensor-icon" />
      </div>
      <p class="node-sensor-grid__sensor-value" :class="{ 'node-sensor-grid__sensor-value--critical': sensor.type === 'moisture' && isCritical }">
        {{ sensor.value }} <span>{{ sensor.unit }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.node-sensor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-sensor-grid__sensor {
  background: var(--nyx-c-surface-container-low, #171c22);
  padding: 1rem;
}

.node-sensor-grid__sensor--critical {
  background: rgba(255, 180, 171, 0.05);
}

.node-sensor-grid__sensor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.node-sensor-grid__sensor-label {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.5));
  letter-spacing: 0.1em;
}

.node-sensor-grid__sensor-icon {
  font-size: 0.75rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.3));
}

.node-sensor-grid__sensor-value {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--nyx-c-on-surface, #dee3eb);
  margin: 0;
}

.node-sensor-grid__sensor-value span {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.75rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
}

.node-sensor-grid__sensor-value--critical {
  color: var(--nyx-c-error, #ffb4ab);
}
</style>
