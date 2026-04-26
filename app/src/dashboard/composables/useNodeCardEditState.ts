import { ref, watch, type ComputedRef, type Ref } from 'vue'

import PlantNode from '@anthos/shared/nodes/classes/PlantNode'
import { useNodesStore } from '@/nodes/stores/nodes'

export function useNodeCardEditState(node: Ref<PlantNode | undefined>, nodeId: ComputedRef<string | undefined>) {
  const nodesStore = useNodesStore()

  const isEditModalOpen = ref(false)
  const editDisplayName = ref(node.value?.displayName ?? '')
  const editIsWateringUnit = ref(node.value?.capability === 'watering')
  const editOrder = ref('')
  const isSavingDisplayName = ref(false)

  watch(() => node.value?.displayName, value => {
    if (!isEditModalOpen.value) {
      editDisplayName.value = value ?? ''
    }
  })

  watch(() => node.value?.capability, value => {
    if (!isEditModalOpen.value) {
      editIsWateringUnit.value = value === 'watering'
    }
  })

  watch(() => node.value?.order, value => {
    if (!isEditModalOpen.value) {
      editOrder.value = value == null ? '' : String(value)
    }
  })

  watch(isEditModalOpen, open => {
    if (open) {
      editDisplayName.value = node.value?.displayName ?? ''
      editIsWateringUnit.value = node.value?.capability === 'watering'
      editOrder.value = node.value?.order == null ? '' : String(node.value.order)
    }
  })

  async function handleEditSubmit(event: Event): Promise<void> {
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
      if (nextDisplayName !== node.value?.displayName) {
        const updatedName = await nodesStore.updateDisplayName(nodeId.value, nextDisplayName)
        if (updatedName) node.value = updatedName
      }

      if (nextCapability !== node.value?.capability) {
        const updatedCapability = await nodesStore.updateCapability(nodeId.value, nextCapability)
        if (updatedCapability) node.value = updatedCapability
      }

      if ((nextOrder ?? null) !== node.value?.order) {
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

  return {
    isEditModalOpen,
    editDisplayName,
    editIsWateringUnit,
    editOrder,
    isSavingDisplayName,
    handleEditSubmit,
  }
}
