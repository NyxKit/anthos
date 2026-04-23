<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { NyxActionItem, NyxButton, NyxDropdown, NyxIcon, NyxSpinner, NyxModal, NyxForm, NyxFormField, NyxInput, NyxSwitch } from 'nyx-kit/components'
import { NyxInputNumberControls, NyxInputType, NyxShape, NyxSize, NyxTheme, NyxVariant, type NyxSelectOption } from 'nyx-kit/types'
import anthos from '@anthos/shared/anthos'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { useLogStore } from '@/logs/stores/logs'
import { useNodesStore } from '@/nodes/stores/nodes'
import { useNodePowerProfile } from '@/dashboard/composables/useNodePowerProfile'
import { useAuthStore } from '@/auth/stores/auth'
import { POWER_PROFILES } from '@anthos/shared/nodes/data/powerProfiles'
import { NodeStatus, PowerProfile } from '@anthos/shared'

const PUMP_VOLUME_ML = 100

const node = defineModel<PlantNode>({ required: true })

const telemetryStore = useTelemetryStore()
const logStore = useLogStore()
const nodesStore = useNodesStore()
const auth = useAuthStore()
const powerProfileSelectOptions: NyxSelectOption<PowerProfile>[] = Object.values(POWER_PROFILES)
  .map(profile => ({ label: profile.label, value: profile.id, icon: profile.icon }))
const canPerformActions = computed(() => auth.canPerformActions)

const isEditModalOpen = ref(false)

const nodeId = computed(() => node.value.id ?? node.value.nodeId)
const { profileStateLoading, selectedProfileOption, applyPowerProfile } = useNodePowerProfile(nodeId)

const pumpState = ref<'idle' | 'loading' | 'error'>('idle')
const pumpError = ref<string | null>(null)
const pumpVolumeMl = ref(String(PUMP_VOLUME_ML))
const pendingPumpCommandId = ref<string | null>(null)

const capability = computed(() => node.value?.capability ?? null)
const nodeTelemetry = computed(() => nodeId.value ? telemetryStore.getNodeTelemetry(nodeId.value) : null)
const isLiveNode = computed(() => node.value?.getStatus(nodeTelemetry.value?.timestampMs) === NodeStatus.Connected)
const editDisplayName = ref(node.value.displayName ?? '')
const editIsWateringUnit = ref(node.value.capability === 'watering')
const editOrder = ref('')
const isSavingDisplayName = ref(false)

watch(() => node.value.displayName, value => {
  if (!isEditModalOpen.value) {
    editDisplayName.value = value ?? ''
  }
})

watch(() => node.value.capability, value => {
  if (!isEditModalOpen.value) {
    editIsWateringUnit.value = value === 'watering'
  }
})

watch(() => node.value.order, value => {
  if (!isEditModalOpen.value) {
    editOrder.value = value == null ? '' : String(value)
  }
})

watch(isEditModalOpen, open => {
  if (open) {
    editDisplayName.value = node.value.displayName ?? ''
    editIsWateringUnit.value = node.value.capability === 'watering'
    editOrder.value = node.value.order == null ? '' : String(node.value.order)
  }
})

const hasTerminalPumpLog = computed(() => {
  if (!pendingPumpCommandId.value || !nodeId.value) return false

  return logStore.entries.some(entry => {
    const meta = entry.meta as { commandId?: string } | undefined
    return meta?.commandId === pendingPumpCommandId.value
      && (entry.message.includes('completed') || entry.message.includes('failed') || entry.message.includes('rejected'))
  })
})

const isPumpPending = computed(() => Boolean(pendingPumpCommandId.value) && !hasTerminalPumpLog.value)

const pumpButtonLabel = computed(() => {
  if (pumpState.value === 'loading' || isPumpPending.value) return 'Pumping...'
  return 'Pump'
})

const isPumpButtonDisabled = computed(() => pumpState.value === 'loading' || isPumpPending.value)

watch(hasTerminalPumpLog, done => {
  if (done && pendingPumpCommandId.value) {
    pendingPumpCommandId.value = null
    pumpState.value = 'idle'
  }
})

onMounted(() => {
  void logStore.start()
})

async function handlePumpClick() {
  if (!nodeId.value) return

  pumpState.value = 'loading'
  pumpError.value = null

  try {
    const response = await anthos.nodes.queuePump(nodeId.value, Number(pumpVolumeMl.value))
    pendingPumpCommandId.value = response.commandId
    pumpState.value = 'idle'
  } catch (error) {
    pumpState.value = 'error'
    pumpError.value = error instanceof Error ? error.message : 'Failed to queue pump command'
  }
}

async function handlePowerProfileSelect(option: NyxSelectOption<PowerProfile>) {
  if (!nodeId.value) return
  await applyPowerProfile(option.value)
}

async function handleEditSubmit(event: Event) {
  event.preventDefault()
  if (!nodeId.value) return

  const nextDisplayName = editDisplayName.value.trim()
  const nextCapability = editIsWateringUnit.value ? 'watering' : 'earth'
  const nextOrderText = typeof editOrder.value === 'number' ? String(editOrder.value) : editOrder.value
  const nextOrder = nextOrderText.trim() === '' ? null : Number(nextOrderText)
  if (!nextDisplayName) return
  if (nextOrder !== null && !Number.isFinite(nextOrder)) return

  isSavingDisplayName.value = true

  try {
    if (nextDisplayName !== node.value.displayName) {
      const updatedName = await nodesStore.updateDisplayName(nodeId.value, nextDisplayName)
      if (updatedName) node.value = updatedName
    }

    if (nextCapability !== node.value.capability) {
      const updatedCapability = await nodesStore.updateCapability(nodeId.value, nextCapability)
      if (updatedCapability) node.value = updatedCapability
    }

    if ((nextOrder ?? null) !== node.value.order) {
      const updatedOrder = await nodesStore.updateOrder(nodeId.value, nextOrder)
      if (updatedOrder) node.value = updatedOrder
    }

    isEditModalOpen.value = false
  } catch (error) {
    console.error('Failed to update node', error)
  } finally {
    isSavingDisplayName.value = false
  }
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

    <NyxButton
      :theme="NyxTheme.Primary"
      :variant="NyxVariant.Subtle"
      :size="NyxSize.Small"
      :shape="NyxShape.Square"
      :disabled="!isLiveNode || !canPerformActions"
      :title="canPerformActions ? 'Edit node' : 'Guests can only view nodes'"
      @click="isEditModalOpen = true"
    >
      <NyxIcon name="pencil" :size="NyxSize.Small" />
    </NyxButton>

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
</style>
