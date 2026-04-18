<script setup lang="ts">
import { computed } from 'vue'
import { NyxIcon } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import { normalizeSoilMoistureByCapability } from '@anthos/shared/nodes/utils/moisture'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { NodeStatus } from '@anthos/shared'

const node = defineModel<PlantNode | undefined>()
const telemetryStore = useTelemetryStore()

const nodeId = computed(() => node.value?.id ?? node.value?.nodeId ?? '')

const nodeTelemetry = computed(() => nodeId.value ? telemetryStore.getNodeTelemetry(nodeId.value) : null)
const isLiveNode = computed(() => node.value?.getStatus(nodeTelemetry.value?.timestampMs) === NodeStatus.Connected)

const sensorConfig: Record<string, { icon: string; label: string }> = {
  lux: { icon: 'sun', label: 'Light' },
  temperature: { icon: 'thermometer', label: 'Temperature' },
  humidity: { icon: 'bubbles', label: 'Humidity' },
  moisture: { icon: 'droplets', label: 'Soil Moisture' },
}

const sensors = computed(() => {
  const telemetry = nodeTelemetry.value
  const capability = telemetry?.capability ?? node.value?.capability ?? null

  return Object.entries(sensorConfig).map(([type, { icon, label }]) => {
    const reading = telemetry?.sensors.find(entry => entry.type === type)
    const moistureCalibration = node.value?.calibration?.moisture ?? null
    const moistureValue = type === 'moisture' && reading && capability
      ? moistureCalibration
        ? moistureCalibration.normalizeRaw(reading.value)
        : normalizeSoilMoistureByCapability(reading.value, capability)
      : null

    return {
      type,
      icon,
      label,
      value: isLiveNode.value && reading ? (type === 'moisture' ? moistureValue?.toFixed(0) ?? '--' : reading.value.toFixed(1)) : '--',
      unit: isLiveNode.value ? (type === 'moisture' ? '%' : reading?.unit || '') : '',
      active: Boolean(isLiveNode.value && reading),
    }
  })
})

const isCritical = computed(() => {
  const telemetry = nodeTelemetry.value
  if (!isLiveNode.value) return false
  const moisture = telemetry?.sensors.find(reading => reading.type === 'moisture')
  if (!moisture || !telemetry?.capability) return false

  const moistureCalibration = node.value?.calibration?.moisture ?? null
  const normalized = moistureCalibration
    ? moistureCalibration.normalizeRaw(moisture.value)
    : normalizeSoilMoistureByCapability(moisture.value, telemetry.capability)

  return normalized < 20
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
  color: var(--nyx-c-danger, #ffb4ab);
}
</style>
