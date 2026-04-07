<script setup lang="ts">
import { NyxProgress, NyxButton } from 'nyx-kit/components'
import { NyxSize, NyxTheme, NyxVariant } from 'nyx-kit/types'
import { ref } from 'vue'

const healthMetrics = ref([
  { label: 'MESH SIGNAL', value: 94, max: 100 },
  { label: 'CPU LOAD', value: 18, max: 100 },
  { label: 'STORAGE UTIL', value: 30, max: 100, total: '1.2 TB / 4 TB' },
])

const getTheme = (value: number, max: number): string => {
  const pct = (value / max) * 100
  if (pct > 80) return NyxTheme.Danger
  if (pct > 50) return NyxTheme.Warning
  return NyxTheme.Success
}
</script>

<template>
  <div class="health-panel">
    <h4 class="health-panel__title">Laboratory Health</h4>
    <div class="health-panel__metrics">
      <div v-for="(metric, index) in healthMetrics" :key="index" class="health-panel__metric">
        <div class="health-panel__metric-header">
          <span class="health-panel__metric-label">{{ metric.label }}</span>
          <span 
            class="health-panel__metric-value"
            :class="`health-panel__metric-value--${getTheme(metric.value, metric.max)}`"
          >
            {{ metric.total || `${metric.value}%` }}
          </span>
        </div>
        <NyxProgress 
          v-model="metric.value" 
          :max="metric.max"
          :theme="getTheme(metric.value, metric.max) as any"
          :size="NyxSize.Small"
        />
      </div>
    </div>
    <NyxButton
      :theme="NyxTheme.Primary"
      :size="NyxSize.XLarge"
      :variant="NyxVariant.Soft"
    >
      Initiate Global Resync
    </NyxButton>
  </div>
</template>

<style scoped>
.health-panel {
  background: var(--nyx-c-bg-soft);
  border-radius: 0.75rem;
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.health-panel__title {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--nyx-c-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1.5rem 0;
}

.health-panel__metrics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  margin-bottom: 1.5rem;
}

.health-panel__metric {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.health-panel__metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-panel__metric-label {
  font-family: var(--nyx-font-family-mono);
  font-size: var(--nyx-font-size-xs);
  color: var(--nyx-c-text-muted);
  letter-spacing: 0.1em;
}

.health-panel__metric-value {
  font-family: var(--nyx-font-family-mono);
  font-size: var(--nyx-font-size-sm);
  color: var(--nyx-c-text-1);
}

.health-panel__metric-value--success {
  color: var(--nyx-c-success);
}

.health-panel__metric-value--warning {
  color: var(--nyx-c-warning);
}

.health-panel__metric-value--danger {
  color: var(--nyx-c-danger);
}
</style>
