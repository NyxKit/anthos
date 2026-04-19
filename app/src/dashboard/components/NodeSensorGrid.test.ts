import { describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'

vi.mock('@/dashboard/stores/telemetry', () => ({
  useTelemetryStore: () => ({
    getNodeTelemetry: () => ({
      nodeId: 'node-001',
      hwId: 'hw-001',
      timestampMs: Date.now(),
      sensors: [
        { type: 'moisture', value: 1500, unit: 'raw' },
      ],
    }),
  }),
}))

import NodeSensorGrid from './NodeSensorGrid.vue'

describe('NodeSensorGrid', () => {
  it('shows normalized moisture even when telemetry capability is missing', async () => {
    setActivePinia(createPinia())

    const wrapper = mount(NodeSensorGrid, {
      props: {
        modelValue: new PlantNode({
          nodeId: 'node-001',
          id: 'node-001',
          hwId: 'hw-001',
          displayName: 'Sprout Node',
          capability: 'earth',
          registeredAt: 1000,
        }),
      },
      global: {
        stubs: {
          NyxIcon: { template: '<span />' },
        },
      },
    })

    expect(wrapper.text()).toContain('100 %')
  })
})
