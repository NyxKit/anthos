<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NyxButton } from 'nyx-kit/components'
import { NyxTheme, NyxSize } from 'nyx-kit/types'
import { useAuthStore } from '@/auth/stores/auth'
import { useNodesStore } from '@/nodes/stores/nodes'
import NodesGrid from '@/nodes/components/NodesGrid.vue'

const store = useNodesStore()
const auth = useAuthStore()
const router = useRouter()
const canPerformActions = computed(() => auth.canPerformActions)

onMounted(() => store.fetchNodes())

async function handleAddNode() {
  await store.openProvisionWindow()
  router.push('/provision').catch(() => {
    // Route may not exist yet — fail silently
  })
}
</script>

<template>
  <div class="nodes-view">
    <div class="nodes-view__header">
      <h2>Nodes</h2>
      <NyxButton
        :theme="NyxTheme.Primary"
        :size="NyxSize.Small"
        :disabled="!canPerformActions"
        :title="canPerformActions ? 'Add Node' : 'Guests can only view nodes'"
        @click="handleAddNode"
      >
        Add Node
      </NyxButton>
    </div>

    <p v-if="store.isLoading && !store.nodes.length" class="nodes-view__loading">Loading…</p>
    <p v-if="store.error" class="nodes-view__error">{{ store.error }}</p>

    <NodesGrid class="nodes-view__section" />
  </div>
</template>

<style scoped>
.nodes-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nodes-view__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nodes-view__header h2 {
  margin: 0;
  margin-right: auto;
}

.nodes-view__loading,
.nodes-view__error {
  color: var(--nyx-c-error, #f87171);
  font-size: 0.875rem;
}

</style>
