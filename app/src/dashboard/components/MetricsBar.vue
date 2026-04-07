<script setup lang="ts">
import { computed } from 'vue'
import { NyxMetricCard } from 'nyx-kit/components'
import { NyxTheme, NyxVariant } from 'nyx-kit/types'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { useNodesStore } from '@/nodes/stores/nodes'

const telemetryStore = useTelemetryStore()
const nodesStore = useNodesStore()

const metrics = computed(() => {
  const connectedNodes = nodesStore.nodes.filter(n => n.claimStatus === 'claimed').length
  const totalNodes = nodesStore.nodes.length
  
  const humidityReadings = telemetryStore.sensors.filter(s => s.type === 'humidity')
  const avgHumidity = humidityReadings.length > 0
    ? Math.round(humidityReadings.reduce((sum, s) => sum + s.value, 0) / humidityReadings.length)
    : 0
  
  const uptimeHours = telemetryStore.health?.uptimeMs 
    ? Math.round(telemetryStore.health.uptimeMs / 3600000)
    : 0
  
  const latency = 24

  return [
    { 
      title: 'Active Nodes', 
      value: `${connectedNodes}/${totalNodes}`, 
      variant: NyxVariant.Soft,
      theme: NyxTheme.Success
    },
    { 
      title: 'Avg. Humidity', 
      value: String(avgHumidity), 
      unit: '%',
      variant: NyxVariant.Soft,
      icon: 'trending-up'
    },
    { 
      title: 'System Uptime', 
      value: String(uptimeHours), 
      unit: 'h',
      variant: NyxVariant.Soft
    },
    { 
      title: 'Network Latency', 
      value: String(latency), 
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