<script setup lang="ts">
import { computed, ref } from 'vue'
import { NyxCard } from 'nyx-kit/components'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import SensorList from '@/dashboard/components/SensorList.vue'
import StatusIndicator from '@/dashboard/components/StatusIndicator.vue'

const store = useTelemetryStore()

const isHealthOpen = ref(false)

const toggleHealth = () => {
  isHealthOpen.value = !isHealthOpen.value
}

const formattedTimestamp = computed(() => {
  const now = Date.now()
  const ts = store.timestampMs ?? 0
  
  if (ts < 1000000000000) return 'No timestamp'
  
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

const rawTimestamp = computed(() => {
  const ts = store.timestampMs ?? 0
  if (ts < 1000000000000) return `N/A (millis: ${ts})`
  return new Date(ts).toISOString()
})

const formattedUptime = computed(() => {
  if (!store.health?.uptimeMs) return '-'
  const hours = Math.floor(store.health.uptimeMs / 3600000)
  const mins = Math.floor((store.health.uptimeMs % 3600000) / 60000)
  return `${hours}h ${mins}m`
})
</script>

<template>
  <NyxCard class="node-card" :title="store.nodeId">
    <template #header>
      <div class="node-card__header">
        <h1>{{ store.nodeId }}</h1>
        <StatusIndicator :status="store.status" @click="toggleHealth" />
      </div>
    </template>
    <dl v-if="isHealthOpen && store.health" class="node-card__health">
      <dt class="label">RSSI</dt>
      <dd>{{ store.health.rssi }} dBm</dd>
      <dt class="label">IP</dt>
      <dd>{{ store.health.ip }}</dd>
      <dt class="label">Uptime</dt>
      <dd>{{ formattedUptime }}</dd>
      <dt class="label">Last Update</dt>
      <dd>{{ formattedTimestamp }}</dd>
      <dt class="label">Timestamp</dt>
      <dd>{{ rawTimestamp }}</dd>
    </dl>

    <div v-if="store.isLoading && !store.sensors.length" class="node-card__loading">
      <p>Loading...</p>
    </div>

    <div v-else-if="!store.sensors.length" class="node-card__empty">
      <p>Waiting for data...</p>
    </div>
    
    <SensorList v-else class="node-card__sensors" :readings="store.sensors" />

    <p v-if="store.error" class="error">{{ store.error }}</p>
  </NyxCard>
</template>

<style scoped>

.node-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.node-card__header h1 {
  margin-right: auto;
}

.node-card__health {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--nyx-c-bg-mute, #1f1f24);
  border-radius: var(--nyx-radius-md, 0.375rem);
  margin-bottom: 1rem;
}

.health-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.node-card__health dt {
  font-size: 0.75rem;
  color: var(--nyx-c-text-muted, #9ca3af);
}

.node-card__loading,
.node-card__empty,
.node-card__error {
  padding: 2rem 0;
  text-align: center;
}
</style>
