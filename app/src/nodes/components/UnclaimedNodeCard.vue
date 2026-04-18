<script setup lang="ts">
import { computed } from 'vue'
import { NyxCard, NyxButton } from 'nyx-kit/components'
import { NyxTheme, NyxSize, NyxVariant } from 'nyx-kit/types'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'

const props = defineProps<{ node: PlantNode }>()
const emit = defineEmits<{ claim: [node: PlantNode] }>()

const formattedRegisteredAt = computed(() => {
  const now = Date.now()
  const diff = now - props.node.registeredAt
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
</script>

<template>
  <NyxCard class="unclaimed-node-card">
    <template #header>
      <div class="unclaimed-node-card__header">
        <h3 class="unclaimed-node-card__id">{{ node.id || node.nodeId }}</h3>
        <NyxButton
          :theme="NyxTheme.Warning"
          :variant="NyxVariant.Soft"
          :size="NyxSize.XSmall"
          disabled
        >
          Unclaimed
        </NyxButton>
      </div>
    </template>

    <div class="unclaimed-node-card__details">
      <span class="label">Registered</span>
      <span>{{ formattedRegisteredAt }}</span>
    </div>

    <NyxButton
      class="unclaimed-node-card__action"
      :theme="NyxTheme.Primary"
      :variant="NyxVariant.Subtle"
      @click="emit('claim', node)"
    >
      Name this node
    </NyxButton>
  </NyxCard>
</template>

<style scoped>
.unclaimed-node-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unclaimed-node-card__id {
  margin-right: auto;
  font-size: 1rem;
  font-weight: 600;
}

.unclaimed-node-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: var(--nyx-c-bg-mute, #1f1f24);
  border-radius: var(--nyx-radius-md, 0.375rem);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.unclaimed-node-card__details .label {
  font-size: 0.75rem;
  color: var(--nyx-c-text-muted, #9ca3af);
}

.unclaimed-node-card__action {
  width: 100%;
}
</style>
