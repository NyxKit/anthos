<script setup lang="ts">
import { computed } from 'vue'
import { NyxButton } from 'nyx-kit/components'
import { NyxSize, NyxTheme, NyxVariant } from 'nyx-kit/types'

const props = defineProps<{
  status: 'connected' | 'disconnected' | 'unknown'
}>()

const indicatorVariant = computed(() => {
  switch (props.status) {
    case 'connected':
      return NyxTheme.Success
    case 'disconnected':
      return NyxTheme.Danger
    default:
      return NyxTheme.Secondary
  }
})

const indicatorText = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'Connected'
    case 'disconnected':
      return 'Disconnected'
    default:
      return 'Unknown'
  }
})
</script>

<template>
  <NyxButton
    :theme="indicatorVariant"
    :size="NyxSize.XSmall"
    :variant="NyxVariant.Soft"
  >
    {{ indicatorText }}
  </NyxButton>
</template>
