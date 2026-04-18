import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import PlantNode from '@anthos/shared/nodes/classes/PlantNode'

const { queuePump } = vi.hoisted(() => ({
  queuePump: vi.fn(),
}))

const { getPowerProfile, applyPowerProfile } = vi.hoisted(() => ({
  getPowerProfile: vi.fn(),
  applyPowerProfile: vi.fn(),
}))

const logStore = vi.hoisted(() => ({
  entries: [] as any[],
  start: vi.fn().mockResolvedValue(undefined),
}))

let resolveQueuePump: ((value: { nodeId: string; commandId: string; status: string }) => void) | null = null

vi.mock('@anthos/shared/anthos', () => ({
  default: {
    nodes: {
      queuePump,
      getPowerProfile,
      applyPowerProfile,
    },
  },
}))

vi.mock('@/dashboard/stores/telemetry', () => ({
    useTelemetryStore: () => ({
      getNodeTelemetry: () => ({
        nodeId: 'node-001',
        hwId: 'hw-001',
        timestampMs: Date.now(),
        capability: 'watering',
        health: { uptimeMs: 3600000, ip: '192.168.1.2', rssi: -42 },
        sensors: [
          { type: 'lux', value: 100, unit: 'lx' },
          { type: 'temperature', value: 21, unit: 'C' },
          { type: 'humidity', value: 45, unit: '%' },
          { type: 'moisture', value: 12, unit: 'raw' },
        ],
      }),
      isNodeOnline: () => true,
  }),
}))

vi.mock('@/logs/stores/logs', () => ({
  useLogStore: () => logStore,
}))

import NodeCard from './NodeCard.vue'

describe('NodeCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    queuePump.mockReset()
    resolveQueuePump = null
    queuePump.mockImplementation(() => new Promise(resolve => {
      resolveQueuePump = resolve
    }))
    getPowerProfile.mockReset()
    getPowerProfile.mockResolvedValue({
      nodeId: 'node-001',
      assignment: {
        profileId: 'balanced',
        telemetryIntervalMs: 600000,
        queueIntervalMs: 600000,
        updatedAt: 1000,
      },
      applied: {
        profileId: 'balanced',
        telemetryIntervalMs: 600000,
        queueIntervalMs: 600000,
        appliedAt: 1000,
      },
    })
    applyPowerProfile.mockReset()
    applyPowerProfile.mockResolvedValue({
      nodeId: 'node-001',
      assignment: {
        profileId: 'performance',
        telemetryIntervalMs: 60000,
        queueIntervalMs: 60000,
        updatedAt: 2000,
      },
      applied: {
        profileId: 'performance',
        telemetryIntervalMs: 60000,
        queueIntervalMs: 60000,
        appliedAt: 2000,
      },
    })
    logStore.entries.splice(0, logStore.entries.length)
    logStore.start.mockClear()
  })

  it('queues a pump command and stays pumping until the completion log arrives', async () => {
    const wrapper = mount(NodeCard, {
      props: {
        modelValue: new PlantNode({
          nodeId: 'node-001',
          id: 'node-001',
          hwId: 'hw-001',
          displayName: 'Sprout Node',
          claimStatus: 'claimed',
          capability: 'watering',
          registeredAt: 1000,
        }),
      },
      global: {
        stubs: {
          NyxCard: { template: '<div><slot name="header" /><slot /></div>' },
          NyxIcon: { template: '<span />' },
          NyxButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          NyxSpinner: { template: '<span />' },
          NyxActionItem: { template: '<div><slot name="action" /><slot /></div>' },
          NyxInput: { template: '<input />' },
          NyxBadge: { template: '<span><slot /></span>' },
          NyxDropdown: {
            props: ['options'],
            emits: ['select'],
            template: '<div><slot /><slot name="dropdown" /><button v-for="option in options" :key="option.value" @click="$emit(\'select\', option)">{{ option.label }}</button></div>',
          },
        },
      },
    })

    expect(logStore.start).toHaveBeenCalled()
    expect(getPowerProfile).toHaveBeenCalledWith('node-001')
    await Promise.resolve()
    await nextTick()
    expect(wrapper.text()).toContain('Balanced')

    await wrapper.findAll('button').find(button => button.text() === 'Performance')?.trigger('click')
    await Promise.resolve()
    await nextTick()

    expect(applyPowerProfile).toHaveBeenCalledWith('node-001', 'performance')
    expect(wrapper.text()).toContain('Performance')

    await wrapper.findAll('button').find(button => button.text() === 'Pump')?.trigger('click')

    expect(queuePump).toHaveBeenCalledWith('node-001', 100)
    resolveQueuePump?.({ nodeId: 'node-001', commandId: 'cmd-123', status: 'pending' })
    await Promise.resolve()
    await nextTick()
    expect(wrapper.text()).toContain('Pumping...')

    logStore.entries.push({
      id: 'log-1',
      timestamp: Date.now(),
      nodeId: 'node-001',
      level: 'info',
      source: 'command-queue',
      message: 'Pump command completed for node-001',
      meta: { commandId: 'cmd-123', result: 'completed' },
    })
    await nextTick()

    expect(wrapper.text()).toContain('Pump')
  })
})
