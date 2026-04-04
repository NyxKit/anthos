<script setup lang="ts">
import { computed } from 'vue'
import { NyxTable, NyxTableCell } from 'nyx-kit/components'
import { NyxTheme, NyxVariant } from 'nyx-kit/types';

const props = defineProps<{
  readings: Array<{ type: string; value: number; unit?: string }>
}>()

const tableData = computed(() => {
  return props.readings.map((item) => {
    const type = String(item.type)
    let displayType = type
    if (type === 'lux') displayType = 'Light'
    else if (type === 'temperature') displayType = 'Temperature'
    else if (type === 'humidity') displayType = 'Humidity'
    else if (type === 'pressure') displayType = 'Pressure'

    const value = item.value === null || item.value === undefined
      ? 'N/A'
      : item.value.toFixed(1)

    return {
      type: displayType,
      value,
      unit: item.unit || '-'
    }
  })
})
</script>

<template>
  <NyxTable
    class="sensor-list"
    v-model="tableData"
    :columnTitles="['Type', 'Value', 'Unit']"
    :gridTemplateColumns="'1fr 100px 80px'"
    :theme="NyxTheme.Info"
    :variant="NyxVariant.Subtle"
    :header="false"
  >
    <template #default="{ item }">
      <template v-for="[key, value] of Object.entries(item ?? {})" :key="value">
        <NyxTableCell :class="`sensor-list__cell--${key}`">{{ value }}</NyxTableCell>
      </template>
    </template>
  </NyxTable>
</template>

<style scoped>
.sensor-list {
  width: 100%;
}

.sensor-list__cell--type {
  font-weight: bold;
}

.sensor-list__cell--value {
  justify-content: flex-end;
}

.sensor-list__cell--value,
.sensor-list__cell--unit {
  font-family: var(--nyx-font-family-mono);
}
</style>
