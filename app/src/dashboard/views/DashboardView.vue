<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { useNodesStore } from '@/nodes/stores/nodes'
import MetricsBar from '@/dashboard/components/MetricsBar.vue'
import ActivityLog from './ActivityLog.vue'
import HealthPanel from './HealthPanel.vue'
import NodesGrid from '@/nodes/components/NodesGrid.vue'

const telemetryStore = useTelemetryStore()
const nodesStore = useNodesStore()

onMounted(() => {
  telemetryStore.startPolling(5000)
  void nodesStore.fetchNodes()
})

onUnmounted(() => {
  telemetryStore.stopPolling()
})
</script>

<template>
  <div class="dashboard">
    <MetricsBar />
    <NodesGrid :limit="3" />
    <footer class="dashboard__footer">
      <ActivityLog class="dashboard__activity-log" />
      <HealthPanel class="dashboard__health-panel" />
    </footer>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard__footer {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.dashboard__activity-log {
  flex: 0 0 70%;
  overflow: hidden;
}

.dashboard__health-panel {
  flex: 0 0 30%;
}
</style>
