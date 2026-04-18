<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NyxButton } from 'nyx-kit/components'
import { NyxTheme, NyxSize } from 'nyx-kit/types'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useNodesStore } from '@/nodes/stores/nodes'
import UnclaimedNodeCard from '@/nodes/components/UnclaimedNodeCard.vue'
import ClaimNodeModal from '@/nodes/components/ClaimNodeModal.vue'
import NodesGrid from '@/nodes/components/NodesGrid.vue'

const store = useNodesStore()
const router = useRouter()

const selectedNode = ref<PlantNode | null>(null)
const isModalOpen = ref(false)

onMounted(() => store.fetchNodes())

const unclaimedNodes = computed(() => store.nodes.filter(n => n.claimStatus === 'unclaimed'))
function openClaimModal(node: PlantNode) {
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
      <div class="nodes-view__unclaimed-grid">
        <UnclaimedNodeCard
          v-for="n in unclaimedNodes"
          :key="n.id || n.nodeId"
          :node="n as PlantNode"
          @claim="openClaimModal"
        />
      </div>
    </section>
    <NodesGrid class="nodes-view__section" />
    <ClaimNodeModal
      :node="selectedNode as PlantNode | null"
      :is-open="isModalOpen"
      @close="isModalOpen = false"
      @claimed="handleClaimed"
    />
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

.nodes-view__section h3 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--nyx-c-text-muted, #9ca3af);
}

.nodes-view__unclaimed-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
}

.nodes-view__loading,
.nodes-view__error {
  color: var(--nyx-c-error, #f87171);
  font-size: 0.875rem;
}

</style>
