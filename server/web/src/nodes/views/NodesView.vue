<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NyxGrid, NyxButton, NyxCard } from 'nyx-kit/components'
import { NyxTheme, NyxSize } from 'nyx-kit/types'
import { useNodesStore } from '@/nodes/stores/nodes'
import UnclaimedNodeCard from '@/nodes/components/UnclaimedNodeCard.vue'
import ClaimNodeModal from '@/nodes/components/ClaimNodeModal.vue'
import type { LogicalNodeRecord } from '@/shared/types/telemetry'

const store = useNodesStore()
const router = useRouter()

const selectedNode = ref<LogicalNodeRecord | null>(null)
const isModalOpen = ref(false)

onMounted(() => store.fetchNodes())

const unclaimedNodes = computed(() => store.nodes.filter(n => n.claimStatus === 'unclaimed'))
const claimedNodes = computed(() => store.nodes.filter(n => n.claimStatus === 'claimed'))

function openClaimModal(node: LogicalNodeRecord) {
  selectedNode.value = node
  isModalOpen.value = true
}

function handleClaimed() {
  isModalOpen.value = false
  selectedNode.value = null
  store.fetchNodes()
}

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
        @click="handleAddNode"
      >
        Add Node
      </NyxButton>
    </div>

    <p v-if="store.isLoading && !store.nodes.length" class="nodes-view__loading">Loading…</p>
    <p v-if="store.error" class="nodes-view__error">{{ store.error }}</p>

    <section v-if="unclaimedNodes.length" class="nodes-view__section">
      <h3>Waiting to be named</h3>
      <NyxGrid :columns="2">
        <UnclaimedNodeCard
          v-for="n in unclaimedNodes"
          :key="n.nodeId"
          :node="n"
          @claim="openClaimModal"
        />
      </NyxGrid>
    </section>

    <section class="nodes-view__section">
      <h3>Named Nodes</h3>
      <p v-if="!claimedNodes.length" class="nodes-view__empty">No named nodes yet.</p>
      <NyxGrid v-else :columns="2">
        <NyxCard
          v-for="n in claimedNodes"
          :key="n.nodeId"
          :title="n.displayName || n.nodeId"
        >
          <div class="named-node__details">
            <span class="label">Node ID</span>
            <span>{{ n.nodeId }}</span>
          </div>
        </NyxCard>
      </NyxGrid>
    </section>

    <ClaimNodeModal
      :node="selectedNode"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @claimed="handleClaimed"
    />
  </div>
</template>

<style scoped>
.nodes-view {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

.nodes-view__section h3 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--nyx-c-text-muted, #9ca3af);
}

.nodes-view__loading,
.nodes-view__empty {
  color: var(--nyx-c-text-muted, #9ca3af);
  font-size: 0.9375rem;
}

.nodes-view__error {
  color: var(--nyx-c-error, #f87171);
  font-size: 0.875rem;
}

.named-node__details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: var(--nyx-c-bg-mute, #1f1f24);
  border-radius: var(--nyx-radius-md, 0.375rem);
  font-size: 0.875rem;
}

.named-node__details .label {
  font-size: 0.75rem;
  color: var(--nyx-c-text-muted, #9ca3af);
}
</style>
