<script setup lang="ts">
import { computed } from 'vue'
import { NyxMetricCard } from 'nyx-kit/components'
import { NyxTheme, NyxVariant } from 'nyx-kit/types'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'

const telemetryStore = useTelemetryStore()

const formatDuration = (ms: number | null): string => {
  if (ms == null) return '--'

  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const metrics = computed(() => {
  const dashboard = telemetryStore.metrics
  const avgHumidity = dashboard?.avgHumidity != null
    ? Math.round(dashboard.avgHumidity)
    : null
  const latency = dashboard?.networkLatencyMs != null
    ? Math.round(dashboard.networkLatencyMs)
    : null

  return [
    {
      title: 'Active Nodes', 
      value: dashboard ? `${dashboard.activeNodes}/${dashboard.totalNodes}` : '--', 
      variant: NyxVariant.Soft,
      theme: NyxTheme.Success
    },
    { 
      title: 'Avg. Humidity', 
      value: avgHumidity == null ? '--' : String(avgHumidity), 
      unit: '%',
      variant: NyxVariant.Soft,
      icon: 'trending-up'
    },
    { 
      title: 'System Uptime', 
      value: formatDuration(dashboard?.uptimeMs ?? null), 
      variant: NyxVariant.Soft
    },
    { 
      title: 'Network Latency', 
      value: latency == null ? '--' : String(latency), 
      unit: 'ms',
      variant: NyxVariant.Soft,
      theme: NyxTheme.Primary
    }
  ]
})
</script>

<template>
  <div class="metrics-bar">
    <NyxMetricCard
      v-for="(metric, index) in metrics"
      :key="index"
      :title="metric.title"
      :value="metric.value"
      :unit="metric.unit"
      :variant="metric.variant"
      :theme="metric.theme"
      :icon="metric.icon"
    />
  </div>
</template>

<style scoped>
.metrics-bar {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .metrics-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .metrics-bar {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
