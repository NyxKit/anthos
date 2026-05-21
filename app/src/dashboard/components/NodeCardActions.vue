<script setup lang="ts">
import { computed, ref } from 'vue'
import { NyxActionItem, NyxButton, NyxDropdown, NyxIcon, NyxSpinner, NyxModal, NyxForm, NyxFormField, NyxInput, NyxSwitch } from 'nyx-kit/components'
import { NyxInputNumberControls, NyxInputType, NyxShape, NyxSize, NyxTheme, NyxVariant, type NyxSelectOption } from 'nyx-kit/types'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { useNodesStore } from '@/nodes/stores/nodes'
import { useNodePowerProfile } from '@/dashboard/composables/useNodePowerProfile'
import { useAuthStore } from '@/auth/stores/auth'
import { POWER_PROFILES } from '@anthos/shared/nodes/data/powerProfiles'
import { NodeStatus, PowerProfile } from '@anthos/shared'
import { useNodeCardEditState } from '@/dashboard/composables/useNodeCardEditState'
import { useNodeCardPumpState } from '@/dashboard/composables/useNodeCardPumpState'

const node = defineModel<PlantNode>({ required: true })

const telemetryStore = useTelemetryStore()
const nodesStore = useNodesStore()
const auth = useAuthStore()
const powerProfileSelectOptions: NyxSelectOption<PowerProfile>[] = Object.values(POWER_PROFILES)
  .map(profile => ({ label: profile.label, value: profile.id, icon: profile.icon }))
const canPerformActions = computed(() => auth.canPerformActions)

const nodeId = computed(() => node.value.id ?? node.value.nodeId)
const { profileStateLoading, selectedProfileOption, applyPowerProfile } = useNodePowerProfile(nodeId)
const capability = computed(() => node.value?.capability ?? null)
const nodeTelemetry = computed(() => nodeId.value ? telemetryStore.getNodeTelemetry(nodeId.value) : null)
const isLiveNode = computed(() => node.value?.getStatus(nodeTelemetry.value?.timestampMs) === NodeStatus.Connected)

const {
  pumpState,
  pumpError,
  pumpVolumeMl,
  isPumpPending,
  pumpButtonLabel,
  isPumpButtonDisabled,
  handlePumpClick,
} = useNodeCardPumpState(nodeId)

const {
  isEditModalOpen,
  editDisplayName,
  editIsWateringUnit,
  editOrder,
  isSavingDisplayName,
  handleEditSubmit,
} = useNodeCardEditState(node, nodeId)

const isDeleteModalOpen = ref(false)
const isDeletingNode = ref(false)
const deleteError = ref('')

function openDeleteModal() {
  deleteError.value = ''
  isDeleteModalOpen.value = true
}

async function handleDeleteSubmit(): Promise<void> {
  if (!nodeId.value) return

  isDeletingNode.value = true
  deleteError.value = ''

  try {
    await nodesStore.deleteNode(nodeId.value)
    isDeleteModalOpen.value = false
  } catch (error) {
    deleteError.value = error instanceof Error ? error.message : 'Failed to delete node'
  } finally {
    isDeletingNode.value = false
  }
}

async function handlePowerProfileSelect(option: NyxSelectOption<PowerProfile>) {
  if (!nodeId.value) return
  await applyPowerProfile(option.value)
}
</script>

<template>
  <div class="node-card-actions">
    <NyxDropdown
      v-if="capability === 'watering'"
      class="node-card-actions__pump-dropdown"
      :theme="NyxTheme.Secondary"
      :size="NyxSize.Small"
    >
      <NyxButton
        :theme="NyxTheme.Secondary"
        :variant="NyxVariant.Subtle"
        :size="NyxSize.Small"
        :shape="NyxShape.Square"
        :disabled="!isLiveNode || !canPerformActions"
        :title="canPerformActions ? 'Pump' : 'Guests can only view nodes'"
      >
        <NyxSpinner v-if="pumpState === 'loading'" :theme="NyxTheme.Secondary" :size="NyxSize.Small" />
        <NyxIcon v-else name="soap-dispenser-droplet" :size="NyxSize.Small" />
      </NyxButton>

      <template #dropdown>
        <NyxActionItem
          class="node-card-actions__pump-action"
          title="Pump"
          :theme="NyxTheme.Secondary"
          :action="pumpState === 'loading' ? 'Pumping...' : 'Pump'"
          @click="handlePumpClick"
        >
          <span class="node-card-actions__pump-status" :data-state="pumpState">
            {{ isPumpPending ? 'Command queued' : pumpState === 'error' ? pumpError || 'Failed to queue pump command' : 'Test the pump flow' }}
          </span>
          <template #action>
            <NyxInput
              v-model="pumpVolumeMl"
              class="node-card-actions__pump-volume"
              :type="NyxInputType.Number"
              :theme="NyxTheme.Secondary"
              :size="NyxSize.Small"
              :min="10"
              :max="500"
              :step="10"
              :number-controls="NyxInputNumberControls.None"
              suffix="ml"
            />
            <NyxButton :theme="NyxTheme.Secondary" :size="NyxSize.Small" :disabled="isPumpButtonDisabled" @click="handlePumpClick">
              <NyxIcon name="soap-dispenser-droplet" :size="NyxSize.Small" /> {{ pumpButtonLabel }}
            </NyxButton>
          </template>
        </NyxActionItem>
      </template>
    </NyxDropdown>

    <NyxDropdown
      class="node-card-actions__profile-dropdown"
      :theme="NyxTheme.Primary"
      :size="NyxSize.Small"
      :options="powerProfileSelectOptions"
      @select="handlePowerProfileSelect"
    >
      <NyxButton
        :theme="NyxTheme.Primary"
        :variant="NyxVariant.Subtle"
        :size="NyxSize.Small"
        :shape="NyxShape.Square"
        :disabled="!isLiveNode || profileStateLoading || !canPerformActions"
        :title="canPerformActions ? 'Apply power profile' : 'Guests can only view nodes'"
      >
        <NyxSpinner v-if="profileStateLoading" :theme="NyxTheme.Primary" :size="NyxSize.Small" />
        <NyxIcon v-else :name="selectedProfileOption?.icon ?? 'question-mark'" :size="NyxSize.Small" />
      </NyxButton>
    </NyxDropdown>

    <NyxDropdown
      class="node-card-actions__menu-dropdown"
      :theme="NyxTheme.Primary"
      :size="NyxSize.Small"
    >
      <NyxButton
        :theme="NyxTheme.Primary"
        :variant="NyxVariant.Subtle"
        :size="NyxSize.Small"
        :shape="NyxShape.Square"
        :disabled="!canPerformActions"
        :title="canPerformActions ? 'Node actions' : 'Guests can only view nodes'"
      >
        <NyxIcon name="ellipsis-vertical" :size="NyxSize.Small" />
      </NyxButton>

      <template #dropdown>
        <NyxActionItem
          title="Edit node"
          action="Edit"
          description="Update the node name, capability, or order."
          :theme="NyxTheme.Primary"
          @click="isEditModalOpen = true"
        />
        <NyxActionItem
          title="Delete node"
          action="Delete"
          description="Remove the node from the list."
          :theme="NyxTheme.Danger"
          @click="openDeleteModal"
        />
      </template>
    </NyxDropdown>

    <NyxModal
      v-model="isEditModalOpen"
      :theme="NyxTheme.Primary"
      :size="NyxSize.Small"
    >
      <template #header>
        <h1 class="node-card-actions__edit-modal-title">Edit node: <span>{{ node.name || node.displayName || node.nodeId }}</span></h1>
      </template>
      <NyxForm :size="NyxSize.Small" @submit="handleEditSubmit">
        <NyxFormField label="Node name">
          <NyxInput v-model="editDisplayName" :theme="NyxTheme.Info" :size="NyxSize.Medium" />
        </NyxFormField>
        <NyxFormField label="Node order">
          <NyxInput
            v-model="editOrder"
            :theme="NyxTheme.Info"
            :size="NyxSize.Medium"
            :type="NyxInputType.Number"
            placeholder="Leave blank for no order"
          />
        </NyxFormField>
        <NyxFormField label="Watering unit">
          <NyxSwitch
            v-model="editIsWateringUnit"
            :theme="NyxTheme.Secondary"
            :size="NyxSize.Medium"
          />
        </NyxFormField>
        <NyxFormField class="node-card-actions__edit-modal-footer">
          <NyxButton
            :theme="NyxTheme.Info"
            :size="NyxSize.Medium"
            :variant="NyxVariant.Subtle"
            @click="isEditModalOpen = false"
          >
            Cancel
          </NyxButton>
          <NyxButton
            :theme="NyxTheme.Success"
            :size="NyxSize.Medium"
            type="submit"
            :loading="isSavingDisplayName"
            :disabled="isSavingDisplayName || !editDisplayName.trim()"
          >
            Save
          </NyxButton>
        </NyxFormField>
      </NyxForm>
    </NyxModal>

    <NyxModal
      v-model="isDeleteModalOpen"
      :theme="NyxTheme.Danger"
      :size="NyxSize.Small"
    >
      <template #header>
        <h1 class="node-card-actions__delete-modal-title">Delete node: <span>{{ node.name || node.displayName || node.nodeId }}</span></h1>
      </template>

      <div class="node-card-actions__delete-modal-body">
        <p>This will remove the node from the list.</p>
        <p>You still need to manually reset the node hardware. If you do not, the server may register it again when telemetry resumes.</p>
        <p v-if="deleteError" class="node-card-actions__delete-modal-error">{{ deleteError }}</p>
      </div>

      <NyxForm :size="NyxSize.Small" @submit="handleDeleteSubmit">
        <NyxFormField class="node-card-actions__delete-modal-footer">
          <NyxButton
            :theme="NyxTheme.Info"
            :size="NyxSize.Medium"
            :variant="NyxVariant.Subtle"
            @click="isDeleteModalOpen = false"
          >
            Cancel
          </NyxButton>
          <NyxButton
            :theme="NyxTheme.Danger"
            :size="NyxSize.Medium"
            type="submit"
            :loading="isDeletingNode"
            :disabled="isDeletingNode"
          >
            Confirm delete
          </NyxButton>
        </NyxFormField>
      </NyxForm>
    </NyxModal>
  </div>
</template>

<style scoped>
.node-card-actions {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 0.25rem;
}

.node-card-actions__pump-status {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.45));
}

.node-card-actions__pump-status[data-state='done'] {
  color: var(--nyx-c-tertiary, #60de87);
}

.node-card-actions__pump-status[data-state='error'] {
  color: var(--nyx-c-error, #ffb4ab);
}

.node-card-actions__pump-volume {
  width: 6rem;
  text-align: center;
}

.node-card-actions__pump-action {
  min-width: min(25rem, 95dvw);
}

.node-card-actions__edit-modal-footer {
  display: flex;
  justify-content: flex-end;
}

.node-card-actions__edit-modal-title {
  font-size: var(--nyx-font-size-lg);
  font-weight: 600;
  color: var(--nyx-c-text-1);
  margin: 0;
}

.node-card-actions__edit-modal-title span {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  color: var(--nyx-c-primary);
  font-weight: 500;
}

.node-card-actions__delete-modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--nyx-c-text-2);
}

.node-card-actions__delete-modal-body p {
  margin: 0;
}

.node-card-actions__delete-modal-error {
  color: var(--nyx-c-error, #ffb4ab);
}

.node-card-actions__delete-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.node-card-actions__delete-modal-title {
  font-size: var(--nyx-font-size-lg);
  font-weight: 600;
  color: var(--nyx-c-text-1);
  margin: 0;
}

.node-card-actions__delete-modal-title span {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  color: var(--nyx-c-danger, #ff7b7b);
  font-weight: 500;
}
</style>
