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
    <!-- Summary Metrics -->
    <section class="dashboard__metrics">
      <MetricsBar />
    </section>

    <!-- Node Grid -->
    <section class="dashboard__nodes">
      <h3 class="dashboard__section-title">Biological Nodes</h3>
      <NyxGrid v-if="dashboardNodes.length" class="dashboard__grid" :columns="3">
        <NodeCard v-for="node in dashboardNodes" :key="node.nodeId" :model-value="node" />
      </NyxGrid>
      <p v-else class="dashboard__nodes-empty">No claimed nodes yet.</p>
    </section>

    <!-- Bottom Panels -->
    <section class="dashboard__panels">
      <div class="dashboard__panels-grid">
        <ActivityLog class="dashboard__activity-log" />
        <HealthPanel class="dashboard__health-panel" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard__section-title {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1rem;
  font-weight: 600;
  color: var(--nyx-c-on-surface-variant, #cfc2d6);
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dashboard__nodes {
  margin-bottom: 1rem;
}

.dashboard__grid {
  gap: 1.5rem;
}

.dashboard__panels {
  margin-top: 1rem;
}

.dashboard__panels-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard__panels-grid {
    grid-template-columns: 2fr 1fr;
  }
}
</style>
