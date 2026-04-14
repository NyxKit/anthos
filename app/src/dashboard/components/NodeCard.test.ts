import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const { queuePump } = vi.hoisted(() => ({
  queuePump: vi.fn(),
}))

vi.mock('@anthos/shared/anthos', () => ({
  default: {
    nodes: {
      queuePump,
    },
  },
}))

vi.mock('@/dashboard/stores/telemetry', () => ({
  useTelemetryStore: () => ({
    nodeId: 'node-001',
    health: { uptimeMs: 3600000, ip: '192.168.1.2', rssi: -42 },
    sensors: [
      { type: 'lux', value: 100, unit: 'lx' },
      { type: 'temperature', value: 21, unit: 'C' },
      { type: 'humidity', value: 45, unit: '%' },
      { type: 'moisture', value: 12, unit: 'raw' },
    ],
    timestampMs: Date.now(),
  }),
}))

import NodeCard from './NodeCard.vue'

describe('NodeCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    queuePump.mockReset()
    queuePump.mockResolvedValue({ nodeId: 'node-001', commandId: 'cmd-123', status: 'pending' })
  })

  it('queues a pump command when the pump button is clicked', async () => {
    const wrapper = mount(NodeCard, {
      global: {
        stubs: {
          NyxCard: { template: '<div><slot name="header" /><slot /></div>' },
          NyxIcon: { template: '<span />' },
          NyxButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        },
      },
    })

    await wrapper.find('button').trigger('click')

    expect(queuePump).toHaveBeenCalledWith('node-001', 100)
    expect(wrapper.text()).toContain('Command queued')
  })
})
