<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { NyxButton, NyxCard, NyxIcon, NyxModal, NyxTable } from 'nyx-kit/components'
import { NyxKit } from 'nyx-kit'
import { NyxShape, NyxSize, NyxTheme, NyxVariant } from 'nyx-kit/types'

import { type AutomationRecord, type AutomationUpsertInput } from '@anthos/shared/automations'
import { AutomationCommandType } from '@anthos/shared/automations'
import { useAuthStore } from '@/auth/stores/auth'
import { useAutomationsStore, type AutomationOption } from '@/automations/stores/automations'
import { AutomationFormMode } from '@/automations/types'
import AutomationForm from '@/automations/components/AutomationForm.vue'

interface AutomationTableRow {
  automationId: string
  node: string
  sensor: string
  operator: string
  value: number
  then: string
}

const store = useAutomationsStore()
const auth = useAuthStore()
const isModalOpen = ref(false)
const selectedAutomation = ref<AutomationRecord | null>(null)
const tableRows = ref<AutomationTableRow[]>([])
const canPerformActions = computed(() => auth.canPerformActions)

const sensorOptionsByNode = computed<Record<string, AutomationOption[]>>(() => Object.fromEntries(store.nodes.map(node => [node.id, store.sensorOptionsForNode(node.id)])))

const formMode = computed(() => selectedAutomation.value ? AutomationFormMode.Edit : AutomationFormMode.Create)

function formatThen(automation: AutomationRecord): string {
  if (automation.commandType === AutomationCommandType.Water) {
    return `Water ${Number(automation.command.volumeMl ?? 0)} ml`
  }

  return automation.commandType
}

function refreshRows(): void {
  const nodeNameById = new Map(store.nodes.map(node => [node.id, node.name]))

  tableRows.value = store.automations.map(automation => ({
    automationId: automation.automationId,
    node: nodeNameById.get(automation.nodeId) ?? automation.nodeId,
    sensor: automation.sensorType,
    operator: automation.operator,
    value: automation.thresholdValue,
    then: formatThen(automation),
  }))
}

watchEffect(refreshRows)

onMounted(() => {
  void store.load()
})

function openCreate(): void {
  selectedAutomation.value = null
  isModalOpen.value = true
}

function openEdit(automationId: string): void {
  selectedAutomation.value = store.automations.find(item => item.automationId === automationId) ?? null
  if (selectedAutomation.value) {
    isModalOpen.value = true
  }
}

async function handleSubmit(payload: AutomationUpsertInput): Promise<void> {
  try {
    if (selectedAutomation.value) {
      await store.updateAutomation(selectedAutomation.value.automationId, payload)
    } else {
      await store.createAutomation(payload)
    }

    isModalOpen.value = false
    selectedAutomation.value = null
  } catch {
    // Store already exposes the error state.
  }
}

async function handleDelete(automationId: string): Promise<void> {
  const automation = store.automations.find(item => item.automationId === automationId)
  if (!automation) return

  const confirmation = await NyxKit.confirm({
    title: 'Delete automation',
    message: `Delete automation for ${automation.nodeId}?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (confirmation.isFailure) return

  try {
    await store.deleteAutomation(automationId)
  } catch {
    // Store already exposes the error state.
  }
}
</script>

<template>
  <section class="automations-view">
    <header class="automations-view__header">
      <NyxButton
        :theme="NyxTheme.Primary"
        :disabled="!canPerformActions"
        :title="canPerformActions ? 'New Automation' : 'Guests can only view automations'"
        @click="openCreate"
      >
        New Automation
      </NyxButton>
    </header>

    <section v-if="tableRows.length === 0" class="automations-view__empty">
      <NyxCard>
        <template #header>
          <span class="automations-view__empty-eyebrow">No automations yet</span>
          <h3>Set up your first rule</h3>
        </template>
        <p class="automations-view__empty-copy">
          Create an automation to watch a sensor and queue a command automatically when conditions match.
        </p>
        <template #footer>
          <NyxButton
            :theme="NyxTheme.Primary"
            :disabled="!canPerformActions"
            :title="canPerformActions ? 'New Automation' : 'Guests can only view automations'"
            @click="openCreate"
          >
            New Automation
          </NyxButton>
        </template>
      </NyxCard>
    </section>

    <NyxTable
      v-else
      v-model="tableRows"
      :size="NyxSize.Small"
      :col-include="['node', 'sensor', 'operator', 'value', 'then']"
    >
      <template #actions="{ item }">
        <NyxButton
          :theme="NyxTheme.Primary"
          :size="NyxSize.Small"
          :shape="NyxShape.Square"
          :variant="NyxVariant.Subtle"
          :disabled="!canPerformActions"
          :title="canPerformActions ? 'Edit automation' : 'Guests can only view automations'"
          @click="openEdit(String(item.automationId))"
        >
          <NyxIcon name="pencil" :size="NyxSize.XSmall" />
        </NyxButton>
        <NyxButton
          :theme="NyxTheme.Danger"
          :size="NyxSize.Small"
          :shape="NyxShape.Square"
          :variant="NyxVariant.Subtle"
          :disabled="!canPerformActions"
          :title="canPerformActions ? 'Delete automation' : 'Guests can only view automations'"
          @click="handleDelete(String(item.automationId))"
        >
          <NyxIcon name="trash" :size="NyxSize.XSmall" />
        </NyxButton>
      </template>
    </NyxTable>

    <NyxModal v-model="isModalOpen" :size="NyxSize.Medium" :theme="NyxTheme.Primary">
      <template #header>
        <h2 class="automations-view__modal-title">{{ selectedAutomation ? 'Edit automation' : 'New automation' }}</h2>
      </template>

      <AutomationForm
        :mode="formMode"
        :automation="selectedAutomation"
        :node-options="store.nodeOptions"
        :sensor-options-by-node="sensorOptionsByNode"
        :busy="store.isLoading"
        @submit="handleSubmit"
        @cancel="isModalOpen = false"
      />
    </NyxModal>
  </section>
</template>

<style scoped>
.automations-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
}

.automations-view__header {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.automations-view__empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.automations-view__empty-copy {
  margin: 0 0 1rem;
}

.automations-view__modal-title {
  margin: 0;
}

.automations-view__empty-eyebrow {
  margin: 0;
  font-family: var(--nyx-font-family-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--nyx-c-primary, #dcb8ff);
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .automations-view__header {
    flex-direction: column;
  }
}
</style>
