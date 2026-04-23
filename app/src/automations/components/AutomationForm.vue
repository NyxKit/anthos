<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NyxButton, NyxForm, NyxFormField, NyxInput, NyxSelect } from 'nyx-kit/components'
import { NyxInputNumberControls, NyxInputType, NyxSize, NyxTheme, NyxVariant, type NyxSelectOption } from 'nyx-kit/types'

import { type AutomationRecord, type AutomationUpsertInput } from '@anthos/shared'
import { AutomationCommandType, AutomationComparisonOperator } from '@anthos/shared/automations'
import { AutomationFormMode } from '@/automations/types'
import type { AutomationOption } from '@/automations/stores/automations'

interface Props {
  mode: AutomationFormMode
  nodeOptions: AutomationOption[]
  sensorOptionsByNode: Record<string, AutomationOption[]>
  automation?: AutomationRecord | null
  busy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  automation: null,
  busy: false,
})

const emit = defineEmits<{
  submit: [payload: AutomationUpsertInput]
  cancel: []
}>()

const operatorOptions: NyxSelectOption<AutomationComparisonOperator>[] = [
  { label: 'Less than', value: AutomationComparisonOperator.LessThan },
  { label: 'Greater than', value: AutomationComparisonOperator.GreaterThan },
  { label: 'Equals', value: AutomationComparisonOperator.Equal },
]

const commandTypeOptions: NyxSelectOption<AutomationCommandType>[] = [
  { label: 'Water', value: AutomationCommandType.Water },
  { label: 'Alert', value: AutomationCommandType.Alert, disabled: true },
]

const nodeId = ref('')
const sensorType = ref('')
const operator = ref<AutomationComparisonOperator>(AutomationComparisonOperator.GreaterThan)
const thresholdValue = ref('')
const commandType = ref<AutomationCommandType>(AutomationCommandType.Water)
const commandVolumeMl = ref('')
const error = ref<string | null>(null)

const isEditMode = computed(() => props.mode === AutomationFormMode.Edit)
const currentSensorOptions = computed(() => props.sensorOptionsByNode[nodeId.value] ?? [])
const submitLabel = computed(() => isEditMode.value ? 'Save changes' : 'Save')

function syncFromAutomation(automation: AutomationRecord | null | undefined): void {
  if (!automation) {
    nodeId.value = ''
    sensorType.value = ''
    operator.value = AutomationComparisonOperator.GreaterThan
    thresholdValue.value = ''
    commandType.value = AutomationCommandType.Water
    commandVolumeMl.value = ''
    return
  }

  nodeId.value = automation.nodeId
  sensorType.value = automation.sensorType
  operator.value = automation.operator
  thresholdValue.value = String(automation.thresholdValue)
  commandType.value = automation.commandType
  commandVolumeMl.value = String(automation.command.volumeMl ?? '')
}

watch(() => props.automation, automation => {
  syncFromAutomation(automation)
}, { immediate: true })

watch(currentSensorOptions, options => {
  if (sensorType.value && !options.some(option => option.value === sensorType.value)) {
    sensorType.value = options[0]?.value ?? ''
  }
}, { immediate: true })

function handleSubmit(): void {
  error.value = null

  if (!nodeId.value) {
    error.value = 'Node is required.'
    return
  }

  if (!sensorType.value) {
    error.value = 'Sensor is required.'
    return
  }

  const threshold = Number(thresholdValue.value)
  if (!Number.isFinite(threshold)) {
    error.value = 'Threshold value is required.'
    return
  }

  if (commandType.value !== AutomationCommandType.Water) {
    error.value = 'Only watering automations are available.'
    return
  }

  const volumeMl = Number(commandVolumeMl.value)
  if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
    error.value = 'Water volume must be a positive number.'
    return
  }

  emit('submit', {
    nodeId: nodeId.value,
    sensorType: sensorType.value as AutomationUpsertInput['sensorType'],
    operator: operator.value,
    thresholdValue: threshold,
    commandType: commandType.value,
    command: {
      commandType: commandType.value,
      volumeMl,
    },
    enabled: props.automation?.enabled ?? true,
  })
}

function handleCancel(): void {
  error.value = null
  emit('cancel')
}
</script>

<template>
  <NyxForm class="automation-form" @submit.prevent="handleSubmit">
    <NyxFormField label="Node">
      <template #default="{ id }">
        <NyxSelect v-model="nodeId" :id="id" :options="nodeOptions" placeholder="Choose node" />
      </template>
    </NyxFormField>

    <NyxFormField label="Sensor">
      <template #default="{ id }">
        <NyxSelect v-model="sensorType" :id="id" :options="currentSensorOptions" placeholder="Choose sensor" :disabled="currentSensorOptions.length === 0" />
      </template>
    </NyxFormField>

    <NyxFormField label="Operator">
      <template #default="{ id }">
        <NyxSelect v-model="operator" :id="id" :options="operatorOptions" />
      </template>
    </NyxFormField>

    <NyxFormField label="Value">
      <template #default="{ id }">
        <NyxInput v-model="thresholdValue" :id="id" :type="NyxInputType.Number" :size="NyxSize.Medium" :theme="NyxTheme.Info" :number-controls="NyxInputNumberControls.None" />
      </template>
    </NyxFormField>

    <NyxFormField label="Then">
      <template #default="{ id }">
        <NyxSelect v-model="commandType" :id="id" :options="commandTypeOptions" />
      </template>
    </NyxFormField>

    <NyxFormField v-if="commandType === AutomationCommandType.Water" label="Water amount">
      <template #default="{ id }">
        <NyxInput v-model="commandVolumeMl" :id="id" :type="NyxInputType.Number" :size="NyxSize.Medium" :theme="NyxTheme.Info" :number-controls="NyxInputNumberControls.None" suffix="ml" />
      </template>
    </NyxFormField>

    <p v-if="error" class="automation-form__error">{{ error }}</p>

    <NyxFormField class="automation-form__actions">
      <NyxButton :theme="NyxTheme.Secondary" :variant="NyxVariant.Subtle" :size="NyxSize.Medium" :disabled="busy" type="button" @click="handleCancel">
        Cancel
      </NyxButton>
      <NyxButton :theme="NyxTheme.Success" :size="NyxSize.Medium" :disabled="busy" type="submit">
        {{ submitLabel }}
      </NyxButton>
    </NyxFormField>
  </NyxForm>
</template>

<style scoped>
.automation-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.automation-form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.automation-form__error {
  color: #ff9b9b;
  font-size: 0.875rem;
}
</style>
