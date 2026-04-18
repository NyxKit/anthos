<script setup lang="ts">
import { computed } from 'vue'
import { NyxCard, NyxStatusDot } from 'nyx-kit/components'
import { NyxSize, NyxTheme, NyxVariant } from 'nyx-kit/types'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import NodeCardActions from './NodeCardActions.vue'
import NodeMeta from './NodeMeta.vue'
import NodeSensorGrid from './NodeSensorGrid.vue'

const node = defineModel<PlantNode | undefined>()

const store = useTelemetryStore()

const nodeId = computed(() => node.value?.id ?? node.value?.nodeId ?? '')

const nodeDisplayName = computed(() => {
  return node.value?.name || node.value?.displayName || nodeId.value || store.nodeId || 'Unknown Node'
})

const isLiveNode = computed(() => {
  return Boolean(nodeId.value) && store.isNodeOnline(nodeId.value)
})

</script>

<template>
  <NyxCard class="node-card" :variant="NyxVariant.Subtle">
    <template #header>
      <div class="node-card__header">
        <div class="node-card__header-title">
          <h1>{{ nodeDisplayName }}</h1>
          <NyxStatusDot
            class="node-card__status-dot"
            :theme="isLiveNode ? NyxTheme.Success : NyxTheme.Info"
            :size="NyxSize.Medium"
            :label="isLiveNode ? 'Online' : 'Offline'"
          />
        </div>
        <NodeCardActions
          v-if="node"
          v-model="node"
        />
      </div>
    </template>
    <NodeSensorGrid v-model="node" />
    <NodeMeta v-model="node" />
  </NyxCard>
</template>

<style scoped>

.node-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__header-title {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  text-transform: uppercase;
}

.node-card__header h1 {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: var(--nyx-font-size-xl);
  font-weight: 700;
  color: var(--nyx-c-text-1);
  margin: 0;
}

.node-card__status-dot {
  text-transform: uppercase;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: var(--nyx-font-size-xs);
  color: var(--nyx-c-text-3);
  letter-spacing: 0.1em;
  font-weight: 700;
}

.node-card__status-dot.theme-success {
  color: var(--nyx-c-success);
}
</style>
