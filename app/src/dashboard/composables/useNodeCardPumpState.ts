import { computed, onMounted, ref, watch, type ComputedRef } from 'vue'

import anthos from '@anthos/shared/anthos'
import { useLogStore } from '@/logs/stores/logs'

const PUMP_VOLUME_ML = 100

export function useNodeCardPumpState(nodeId: ComputedRef<string | undefined>) {
  const logStore = useLogStore()

  const pumpState = ref<'idle' | 'loading' | 'error'>('idle')
  const pumpError = ref<string | null>(null)
  const pumpVolumeMl = ref(String(PUMP_VOLUME_ML))
  const pendingPumpCommandId = ref<string | null>(null)

  onMounted(() => {
    void logStore.start()
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

  async function handlePumpClick(): Promise<void> {
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

  return {
    pumpState,
    pumpError,
    pumpVolumeMl,
    pendingPumpCommandId,
    hasTerminalPumpLog,
    isPumpPending,
    pumpButtonLabel,
    isPumpButtonDisabled,
    handlePumpClick,
  }
}
