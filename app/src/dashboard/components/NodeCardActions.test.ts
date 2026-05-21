import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'

const testState = vi.hoisted(() => ({
  deleteNode: vi.fn(),
  editModalOpen: { value: false },
  editSubmit: vi.fn(),
}))

vi.mock('@/nodes/stores/nodes', () => ({
  useNodesStore: () => ({
    deleteNode: testState.deleteNode,
    updateDisplayName: vi.fn(),
    updateCapability: vi.fn(),
    updateOrder: vi.fn(),
    openProvisionWindow: vi.fn(),
  }),
}))

vi.mock('@/dashboard/composables/useNodeCardEditState', () => ({
  useNodeCardEditState: () => ({
    isEditModalOpen: testState.editModalOpen,
    editDisplayName: 'Fern',
    editIsWateringUnit: false,
    editOrder: '',
    isSavingDisplayName: false,
    handleEditSubmit: testState.editSubmit,
  }),
}))

vi.mock('@/dashboard/composables/useNodeCardPumpState', () => ({
  useNodeCardPumpState: () => ({
    pumpState: ref('idle'),
    pumpError: ref(''),
    pumpVolumeMl: ref(100),
    isPumpPending: ref(false),
    pumpButtonLabel: ref('Pump'),
    isPumpButtonDisabled: ref(false),
    handlePumpClick: vi.fn(),
  }),
}))

vi.mock('@/dashboard/composables/useNodePowerProfile', () => ({
  useNodePowerProfile: () => ({
    profileStateLoading: ref(false),
    selectedProfileOption: ref({ icon: 'question-mark' }),
    applyPowerProfile: vi.fn(),
  }),
}))

vi.mock('@/dashboard/stores/telemetry', () => ({
  useTelemetryStore: () => ({
    getNodeTelemetry: () => null,
  }),
}))

vi.mock('@/auth/stores/auth', () => ({
  useAuthStore: () => ({
    canPerformActions: true,
  }),
}))

import NodeCardActions from './NodeCardActions.vue'

describe('NodeCardActions', () => {
  beforeEach(() => {
    testState.deleteNode.mockReset()
    testState.editSubmit.mockReset()
    testState.editModalOpen.value = false
    testState.deleteNode.mockResolvedValue(undefined)
  })

  it('keeps the actions menu enabled when the node is offline', async () => {
    const wrapper = mount(NodeCardActions, {
      props: {
        modelValue: new PlantNode({ nodeId: 'node-001', id: 'node-001', hwId: 'hw-001', registeredAt: 1, capability: 'earth' }),
      },
      global: {
        stubs: {
          NyxButton: { template: '<button :disabled="disabled" :title="title" @click="$emit(\'click\')"><slot /></button>', props: ['disabled', 'title'] },
          NyxDropdown: {
            data: () => ({ open: false }),
            template: '<div><div data-test="trigger" @click="open = !open"><slot /></div><div v-if="open"><slot name="dropdown" /></div></div>',
          },
          NyxActionItem: { template: '<button @click="$emit(\'click\')"><slot />{{ action }}</button>', props: ['action'] },
          NyxIcon: { template: '<span />' },
          NyxSpinner: { template: '<span />' },
          NyxModal: { template: '<div v-if="modelValue"><slot name="header" /><slot /></div>', props: ['modelValue'] },
          NyxForm: { template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>' },
          NyxFormField: { template: '<div><slot /><slot name="default" /></div>' },
          NyxInput: { template: '<input />' },
          NyxSwitch: { template: '<input type="checkbox" />' },
        },
      },
    })

    const trigger = wrapper.get('button[title="Node actions"]')
    expect(trigger.attributes('disabled')).toBeUndefined()

    await trigger.trigger('click')

    const buttonLabels = wrapper.findAll('button').map(button => button.text())
    expect(buttonLabels).toContain('Edit')
    expect(buttonLabels).toContain('Delete')
  })

  it('shows a manual-reset warning before deleting a node', async () => {
    const wrapper = mount(NodeCardActions, {
      props: {
        modelValue: new PlantNode({ nodeId: 'node-001', id: 'node-001', hwId: 'hw-001', registeredAt: 1, capability: 'earth' }),
      },
      global: {
        stubs: {
          NyxButton: { template: '<button :disabled="disabled" :title="title" @click="$emit(\'click\')"><slot /></button>', props: ['disabled', 'title'] },
          NyxDropdown: {
            data: () => ({ open: false }),
            template: '<div><div @click="open = !open"><slot /></div><div v-if="open"><slot name="dropdown" /></div></div>',
          },
          NyxActionItem: { template: '<button @click="$emit(\'click\')"><slot />{{ action }}</button>', props: ['action'] },
          NyxIcon: { template: '<span />' },
          NyxSpinner: { template: '<span />' },
          NyxModal: { template: '<div v-if="modelValue"><slot name="header" /><slot /></div>', props: ['modelValue'] },
          NyxForm: { template: '<form @submit.prevent="$emit(\'submit\')"><slot /></form>' },
          NyxFormField: { template: '<div><slot /><slot name="default" /></div>' },
          NyxInput: { template: '<input />' },
          NyxSwitch: { template: '<input type="checkbox" />' },
        },
      },
    })

    await wrapper.get('button[title="Node actions"]').trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Delete')?.trigger('click')

    expect(wrapper.text()).toContain('manually reset')

    const forms = wrapper.findAll('form')
    await forms[forms.length - 1]?.trigger('submit')

    expect(testState.deleteNode).toHaveBeenCalledWith('node-001')
  })
})
