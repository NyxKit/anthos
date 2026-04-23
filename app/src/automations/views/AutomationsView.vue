<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { NyxButton, NyxIcon, NyxModal, NyxTable } from 'nyx-kit/components'
import { NyxKit } from 'nyx-kit'
import { NyxShape, NyxSize, NyxTheme, NyxVariant } from 'nyx-kit/types'

import { type AutomationRecord, type AutomationUpsertInput } from '@anthos/shared/automations'
import { AutomationCommandType } from '@anthos/shared/automations'
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
const isModalOpen = ref(false)
const selectedAutomation = ref<AutomationRecord | null>(null)
const tableRows = ref<AutomationTableRow[]>([])

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
      <NyxButton :theme="NyxTheme.Primary" @click="openCreate">New Automation</NyxButton>
    </header>

    <NyxTable
      v-model="tableRows"
      :size="NyxSize.Small"
      :col-include="['node', 'sensor', 'operator', 'value', 'then']"
    >
      <template #actions="{ item }">
        <NyxButton :theme="NyxTheme.Primary" :size="NyxSize.Small" :shape="NyxShape.Square" :variant="NyxVariant.Subtle" @click="openEdit(String(item.automationId))">
          <NyxIcon name="pencil" :size="NyxSize.XSmall" />
        </NyxButton>
        <NyxButton :theme="NyxTheme.Danger" :size="NyxSize.Small" :shape="NyxShape.Square" :variant="NyxVariant.Subtle" @click="handleDelete(String(item.automationId))">
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
}

.automations-view__header {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.automations-view__modal-title {
  margin: 0;
}

@media (max-width: 768px) {
  .automations-view__header {
    flex-direction: column;
  }
}
</style>
