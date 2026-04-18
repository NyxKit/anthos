<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { useNodesStore } from '@/nodes/stores/nodes'
import NodeCard from '@/dashboard/components/NodeCard.vue'
import MetricsBar from '@/dashboard/components/MetricsBar.vue'
import ActivityLog from './ActivityLog.vue'
import HealthPanel from './HealthPanel.vue'
import { NyxGrid } from 'nyx-kit/components'

const telemetryStore = useTelemetryStore()
const nodesStore = useNodesStore()

const dashboardNodes = computed(() => {
  const claimedNodes = nodesStore.nodes.filter(node => node.claimStatus === 'claimed')
  const activeNodeId = telemetryStore.nodeId

  if (!activeNodeId) {
    return claimedNodes.slice(0, 3)
  }

  const activeIndex = claimedNodes.findIndex(node => node.nodeId === activeNodeId)
  if (activeIndex === -1) {
    return claimedNodes.slice(0, 3)
  }

  const nodes = [...claimedNodes]
  const [activeNode] = nodes.splice(activeIndex, 1)
  return [activeNode, ...nodes].slice(0, 3)
})

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
    <NyxGrid v-if="dashboardNodes.length" class="dashboard__nodes" :columns="3">
      <NodeCard v-for="node in dashboardNodes" :key="node.nodeId" :model-value="node" />
    </NyxGrid>
    <p v-else class="dashboard__nodes dashboard__nodes--empty">No claimed nodes yet.</p>
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
  flex: 1 0 75%;
}

.dashboard__health-panel {
  flex: 1 0 25%;
}
</style>
