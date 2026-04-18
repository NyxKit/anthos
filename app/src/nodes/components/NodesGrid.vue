<script setup lang="ts">
import { computed } from 'vue'
import { NyxGrid } from 'nyx-kit/components'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useNodesStore } from '@/nodes/stores/nodes'
import NodeCard from '@/dashboard/components/NodeCard.vue'

const props = defineProps<{ limit?: number }>()

const store = useNodesStore()

const claimedNodes = computed(() => store.nodes.filter(node => node.claimStatus === 'claimed'))

const visibleNodes = computed(() => {
  if (!props.limit || props.limit <= 0) return claimedNodes.value
  return claimedNodes.value.slice(0, props.limit)
})
</script>

<template>
  <p v-if="visibleNodes.length === 0" class="nodes-grid__empty">No claimed nodes yet.</p>
  <NyxGrid v-else class="nodes-grid" :columns="3">
    <NodeCard
      v-for="node in visibleNodes"
      :key="node.id || node.nodeId"
      :model-value="node as PlantNode"
    />
  </NyxGrid>
</template>

<style scoped>
.nodes-grid__empty {
  color: var(--nyx-c-text-muted, #9ca3af);
  font-size: 0.9375rem;
  margin: 0;
}
</style>
