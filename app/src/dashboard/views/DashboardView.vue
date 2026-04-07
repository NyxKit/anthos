<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import NodeCard from '@/dashboard/components/NodeCard.vue'
import { NyxGrid } from 'nyx-kit/components'

const store = useTelemetryStore()

onMounted(() => {
  store.startPolling(5000)
})

onUnmounted(() => {
  store.stopPolling()
})
</script>

<template>
  <NyxGrid class="dashboard" :columns="4">
    <NodeCard />
  </NyxGrid>
</template>
