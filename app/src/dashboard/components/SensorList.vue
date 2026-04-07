<script setup lang="ts">
import { computed } from 'vue'
import { NyxIcon } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'

const props = defineProps<{
  readings: Array<{ type: string; value: number; unit?: string }>
}>()

const sensorConfig: Record<string, { icon: string; label: string }> = {
  lux: { icon: 'sun', label: 'Light' },
  temperature: { icon: 'thermometer', label: 'Temperature' },
  humidity: { icon: 'bubbles', label: 'Humidity' },
  pressure: { icon: 'circle-gauge', label: 'Pressure' },
  moisture: { icon: 'droplets', label: 'Moisture' },
}

const sensors = computed(() => {
  return Object.entries(sensorConfig).map(([type, { icon, label }]) => {
    const reading = props.readings.find(r => r.type === type)
    return {
      type,
      icon,
      label,
      value: reading ? reading.value.toFixed(1) : '--',
      unit: reading?.unit || '',
      active: !!reading,
    }
  })
})
</script>

<template>
  <div class="sensor-list">
    <div v-for="sensor in sensors" :key="sensor.type" class="sensor-item" :class="{ 'sensor-item--inactive': !sensor.active }">
      <NyxIcon :name="sensor.icon" :size="NyxSize.Medium" />
      <span class="sensor-item__label">{{ sensor.label }}</span>
      <span class="sensor-item__value">{{ sensor.value }}</span>
      <span class="sensor-item__unit" v-if="sensor.unit">{{ sensor.unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.sensor-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sensor-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--nyx-radius-md, 0.375rem);
  background-color: var(--nyx-c-bg-mute, #1f1f24);
}

.sensor-item--inactive {
  opacity: 0.35;
}

.sensor-item__label {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

.sensor-item__value {
  font-family: var(--nyx-font-family-mono);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
  min-width: 4ch;
}

.sensor-item__unit {
  flex: 0 0 3ch;
  font-size: 0.75rem;
  color: var(--nyx-c-text-muted, #9ca3af);
}
</style>
