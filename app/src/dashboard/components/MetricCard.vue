<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  unit?: string
  variant?: 'default' | 'tertiary' | 'primary' | 'error'
  trend?: 'up' | 'down' | 'stable'
}>()

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up': return 'trending_up'
    case 'down': return 'trending_down'
    default: return 'trending_flat'
  }
})

const borderColor = computed(() => {
  switch (props.variant) {
    case 'tertiary': return 'var(--nyx-c-tertiary, #60de87)'
    case 'primary': return 'var(--nyx-c-primary, #dcb8ff)'
    case 'error': return 'var(--nyx-c-error, #ffb4ab)'
    default: return 'var(--nyx-c-outline-variant, #4c4354)'
  }
})
</script>

<template>
  <div class="metric-card" :style="{ borderLeftColor: borderColor }">
    <div class="metric-card__content">
      <p class="metric-card__label">{{ label }}</p>
      <div class="metric-card__value-row">
        <span class="metric-card__value">{{ value }}</span>
        <span v-if="unit" class="metric-card__unit">{{ unit }}</span>
        <span v-if="trend" class="metric-card__trend" :class="`metric-card__trend--${trend}`">
          <span class="material-symbols-outlined">{{ trendIcon }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metric-card {
  padding: 1rem;
  background: var(--nyx-c-surface-container, #1b2026);
  border-radius: 0.5rem;
  border-left: 2px solid var(--nyx-c-tertiary, #60de87);
}

.metric-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-card__label {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
}

.metric-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.metric-card__value {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--nyx-c-on-surface, #dee3eb);
  letter-spacing: -0.025em;
}

.metric-card__unit {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.75rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
}

.metric-card__trend {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.metric-card__trend--up {
  color: var(--nyx-c-tertiary, #60de87);
}

.metric-card__trend--down {
  color: var(--nyx-c-error, #ffb4ab);
}

.metric-card__trend--stable {
  color: var(--nyx-c-primary, #dcb8ff);
}

.metric-card__trend :deep(.material-symbols-outlined) {
  font-size: 1rem;
}
</style>