<script setup lang="ts">
import { ref, watch } from 'vue'
import { NyxButton } from 'nyx-kit/components'
import { NyxTheme, NyxVariant } from 'nyx-kit/types'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useNodesStore } from '@/nodes/stores/nodes'

const props = defineProps<{ node: PlantNode | null; isOpen: boolean }>()
const emit = defineEmits<{ close: []; claimed: [nodeId: string, displayName: string, capability: 'earth' | 'watering'] }>()

const store = useNodesStore()
const displayName = ref('')
const capability = ref<'earth' | 'watering'>('earth')
const isSaving = ref(false)

// Reset input when modal opens with a new node
watch(() => props.isOpen, (open) => {
  if (open) {
    displayName.value = ''
    capability.value = 'earth'
  }
})

async function handleSave() {
  if (!props.node || !displayName.value.trim()) return
  isSaving.value = true
  try {
    await store.claimNode(props.node.id || props.node.nodeId, displayName.value.trim(), capability.value)
    emit('claimed', props.node.id || props.node.nodeId, displayName.value.trim(), capability.value)
  } catch {
    // error already set in store
  } finally {
    isSaving.value = false
  }
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen && node" class="modal-backdrop" @click.self="handleClose">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title" class="modal-card__title">Name your node</h2>
        <p class="modal-card__subtitle">Node ID: {{ node.id || node.nodeId }}</p>

        <input
          v-model="displayName"
          class="modal-card__input"
          type="text"
          placeholder="e.g. Living Room, Balcony Herbs"
          autofocus
          @keydown.enter="handleSave"
          @keydown.esc="handleClose"
        />

        <label class="modal-card__label" for="node-capability">Hardware type</label>
        <select id="node-capability" v-model="capability" class="modal-card__input">
          <option value="earth">Earth only</option>
          <option value="watering">Watering unit</option>
        </select>

        <!-- TODO: plant linking (Phase 3) -->

        <div class="modal-card__actions">
          <NyxButton
            :theme="NyxTheme.Primary"
            :disabled="!displayName.trim() || isSaving"
            @click="handleSave"
          >
            {{ isSaving ? 'Saving…' : 'Save' }}
          </NyxButton>
          <NyxButton
            :variant="NyxVariant.Soft"
            :disabled="isSaving"
            @click="handleClose"
          >
            Cancel
          </NyxButton>
        </div>

        <p v-if="store.error" class="modal-card__error">{{ store.error }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background-color: var(--nyx-c-bg-soft, #18181b);
  border: 1px solid var(--nyx-c-border, #2d2d32);
  border-radius: var(--nyx-radius-lg, 0.5rem);
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.modal-card__subtitle {
  font-size: 0.875rem;
  color: var(--nyx-c-text-muted, #9ca3af);
  margin: 0;
}

.modal-card__input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: var(--nyx-c-bg-mute, #1f1f24);
  border: 1px solid var(--nyx-c-border, #2d2d32);
  border-radius: var(--nyx-radius-md, 0.375rem);
  color: var(--nyx-c-text, #e4e4e7);
  font-size: 0.9375rem;
  outline: none;
  box-sizing: border-box;
}

.modal-card__label {
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--nyx-c-text-muted, #9ca3af);
  margin-top: 0.25rem;
}

.modal-card__input:focus {
  border-color: var(--nyx-c-primary, #6d6df0);
}

.modal-card__actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.modal-card__error {
  font-size: 0.8125rem;
  color: var(--nyx-c-error, #f87171);
  margin: 0;
}
</style>
