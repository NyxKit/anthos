<script setup lang="ts">
import { computed, ref } from 'vue'
import { NyxCard, NyxIcon, NyxActionItem, NyxBadge, NyxInput, NyxButton } from 'nyx-kit/components'
import { NyxInputType, NyxSize, NyxTheme } from 'nyx-kit/types'
import anthos from '@anthos/shared/anthos'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { logo } from '@/shared/assets'
import type { LogicalNodeRecord } from '@anthos/shared'

const PUMP_DURATION_MS = 5000

const props = defineProps<{
  node?: LogicalNodeRecord
}>()

const store = useTelemetryStore()
const pumpState = ref<'idle' | 'loading' | 'done' | 'error'>('idle')
const pumpError = ref<string | null>(null)
const pumpDuration = ref(String(PUMP_DURATION_MS))

const formattedTimestamp = computed(() => {
  const now = Date.now()
  const ts = store.timestampMs ?? 0

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

const formattedUptime = computed(() => {
  if (!store.health?.uptimeMs) return '-'
  const hours = Math.floor(store.health.uptimeMs / 3600000)
  const mins = Math.floor((store.health.uptimeMs % 3600000) / 60000)
  return `${hours}h ${mins}m`
})

const nodeDisplayName = computed(() => {
  return props.node?.displayName || props.node?.nodeId || store.nodeId || 'Unknown Node'
})

const capability = computed(() => props.node?.capability ?? store.node?.capability)
const capabilityLabel = computed(() => capability.value === 'watering' ? 'Watering' : 'Earth')

const getSensorValue = (type: string) => {
  const sensor = store.sensors.find(s => s.type === type)
  return sensor ? sensor.value.toFixed(1) : '--'
}

const getSensorUnit = (type: string) => {
  const sensor = store.sensors.find(s => s.type === type)
  return sensor?.unit || ''
}

const isCritical = computed(() => {
  const moisture = store.sensors.find(s => s.type === 'moisture')
  return moisture && moisture.value < 20
})

const actionNodeId = computed(() => props.node?.nodeId || store.nodeId || '')

async function handlePumpClick() {
  if (!actionNodeId.value) return

  pumpState.value = 'loading'
  pumpError.value = null

  try {
    await anthos.nodes.queuePump(actionNodeId.value, parseInt(pumpDuration.value))
    pumpState.value = 'done'
  } catch (error) {
    pumpState.value = 'error'
    pumpError.value = error instanceof Error ? error.message : 'Failed to queue pump command'
  }
}
</script>

<template>
  <NyxCard class="node-card" :class="{ 'node-card--critical': isCritical }">
    <!-- Header -->
    <template #header>
      <div class="node-card__header">
        <div class="node-card__header-left">
          <div class="node-card__icon">
            <img :src="logo" alt="Node" />
          </div>
          <div>
            <h3>{{ nodeDisplayName }}</h3>
            <div class="node-card__status">
              <span class="node-card__status-dot node-card__status-dot--connected"></span>
              <span class="node-card__status-text">Connected</span>
              <NyxBadge :theme="capability === 'watering' ? NyxTheme.Secondary : NyxTheme.Info" :size="NyxSize.Small">{{ capabilityLabel }}</NyxBadge>
            </div>
          </div>
        </div>
        <div class="node-card__header-right" v-if="props.node">
          <p class="node-card__location">Lab A // Bench 04</p>
          <p class="node-card__id">ID: {{ props.node.hwId }}</p>
        </div>
      </div>
    </template>

    <!-- Sensor Grid -->
    <div class="node-card__sensors">
      <div class="node-card__sensor">
          <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">LIGHT</span>
          <NyxIcon name="sun" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value">{{ getSensorValue('lux') }} <span>{{ getSensorUnit('lux') }}</span></p>
      </div>
      <div class="node-card__sensor">
        <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">TEMPERATURE</span>
          <NyxIcon name="thermometer" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value">{{ getSensorValue('temperature') }} <span>{{ getSensorUnit('temperature') }}</span></p>
      </div>
      <div class="node-card__sensor">
        <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">HUMIDITY</span>
          <NyxIcon name="bubbles" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value">{{ getSensorValue('humidity') }} <span>{{ getSensorUnit('humidity') }}</span></p>
      </div>
      <div class="node-card__sensor" :class="{ 'node-card__sensor--critical': isCritical }">
        <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">SOIL MOISTURE</span>
          <NyxIcon name="droplets" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value" :class="{ 'node-card__sensor-value--critical': isCritical }">
          {{ getSensorValue('moisture') }} <span>{{ getSensorUnit('moisture') }}</span>
        </p>
      </div>
    </div>

    <!-- Metadata Footer -->
    <div class="node-card__footer">
      <div class="node-card__footer-row">
        <span>PRESSURE</span>
        <span>1013.25 PA</span>
      </div>
      <div class="node-card__footer-row">
        <span>IP ADDRESS</span>
        <span>{{ store.health?.ip || '192.168.1.x' }}</span>
      </div>
      <div class="node-card__footer-row">
        <span>UPTIME</span>
        <span>{{ formattedUptime }}</span>
      </div>
      <div class="node-card__footer-bottom">
        <div class="node-card__rssi">
          <NyxIcon name="wifi" :size="NyxSize.Small" />
          <span>RSSI: {{ store.health?.rssi || '--' }}dBm</span>
        </div>
        <span class="node-card__updated">Updated {{ formattedTimestamp }}</span>
      </div>
    </div>

    <NyxActionItem
      title="Pump"
      :theme="NyxTheme.Secondary"
      :action="pumpState === 'loading' ? 'Pumping...' : 'Pump'"
      @click="handlePumpClick"
    >
      <span class="node-card__pump-status" :data-state="pumpState">
        {{ pumpState === 'done' ? 'Command queued' : pumpState === 'error' ? pumpError || 'Failed to queue pump command' : 'Test the pump flow' }}
      </span>
      <template #action>
        <NyxInput
          class="node-card__pump-duration"
          :type="NyxInputType.Number"
          :theme="NyxTheme.Secondary"
          :size="NyxSize.Small"
          :min="1000"
          :max="20000"
          :step="500"
          v-model="pumpDuration"
        />
        <NyxButton :theme="NyxTheme.Secondary" :size="NyxSize.Small" :disabled="pumpState === 'loading'" @click="handlePumpClick">
          {{ pumpState === 'loading' ? 'Pumping...' : 'Pump' }}
        </NyxButton>
      </template>
    </NyxActionItem>
  </NyxCard>
</template>

<style scoped>
.node-card {
  background: var(--nyx-c-surface-container-low, #171c22);
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
  border-radius: 0.75rem;
  overflow: hidden;
  transition: border-color 0.3s ease;
  padding: 0;
}

.node-card:hover {
  border-color: var(--nyx-c-primary, rgba(220, 184, 255, 0.3));
}

.node-card--critical {
  border-color: var(--nyx-c-error, rgba(255, 180, 171, 0.3));
}

.node-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__header-left {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.node-card__icon {
  width: 3rem;
  height: 3rem;
  background: var(--nyx-c-surface-container-high, #252a30);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--nyx-c-primary, rgba(220, 184, 255, 0.1));
  overflow: hidden;
}

.node-card__icon img {
  width: 2rem;
  height: 2rem;
  opacity: 0.8;
}

.node-card__header h3 {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--nyx-c-on-surface, #dee3eb);
  margin: 0;
  letter-spacing: -0.025em;
}

.node-card__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.node-card__capability {
  padding: 0.125rem 0.4rem;
  border-radius: 999px;
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--nyx-c-text-1, #dee3eb);
  background: rgba(109, 109, 240, 0.12);
  border: 1px solid rgba(109, 109, 240, 0.25);
}

.node-card__status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.node-card__status-dot--connected {
  background: var(--nyx-c-tertiary, #60de87);
  box-shadow: 0 0 8px rgba(96, 222, 135, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.node-card__status-text {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-tertiary, #60de87);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.node-card__header-right {
  text-align: right;
}

.node-card__location {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
  margin: 0;
}

.node-card__id {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
  margin: 0.25rem 0 0 0;
}

/* Sensor Grid */
.node-card__sensors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__sensor {
  background: var(--nyx-c-surface-container-low, #171c22);
  padding: 1rem;
}

.node-card__sensor--critical {
  background: rgba(255, 180, 171, 0.05);
}

.node-card__sensor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.node-card__sensor-label {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.5));
  letter-spacing: 0.1em;
}

.node-card__sensor-icon {
  font-size: 0.75rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.3));
}

.node-card__sensor-value {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--nyx-c-on-surface, #dee3eb);
  margin: 0;
}

.node-card__sensor-value span {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.75rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
}

.node-card__sensor-value--critical {
  color: var(--nyx-c-error, #ffb4ab);
}

/* Footer */
.node-card__footer {
  padding: 1rem;
  background: var(--nyx-c-surface-container-lowest, #0a0f14);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-card__footer-row {
  display: flex;
  justify-content: space-between;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
}

.node-card__footer-row span:first-child {
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
}

.node-card__footer-row span:last-child {
  color: var(--nyx-c-on-surface, #dee3eb);
}

.node-card__footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.node-card__pump-button {
  min-width: 5rem;
}

.node-card__pump-status {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.45));
}

.node-card__pump-status[data-state='done'] {
  color: var(--nyx-c-tertiary, #60de87);
}

.node-card__pump-status[data-state='error'] {
  color: var(--nyx-c-error, #ffb4ab);
}

.node-card__rssi {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
}

.node-card__updated {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.5625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.3));
  font-style: italic;
  text-transform: uppercase;
}

.node-card__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__pump-status {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.45));
}

.node-card__pump-status[data-state='done'] {
  color: var(--nyx-c-tertiary, #60de87);
}

.node-card__pump-status[data-state='error'] {
  color: var(--nyx-c-error, #ffb4ab);
}

.node-card__pump-duration {
  width: 5rem;
  text-align: center;
}
</style>
