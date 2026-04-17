import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'

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
      nodeId: 'node-001',
      status: 'connected',
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

vi.mock('@/logs/stores/logs', () => ({
  useLogStore: () => logStore,
}))

import NodeCard from './NodeCard.vue'

describe('NodeCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    queuePump.mockReset()
    queuePump.mockResolvedValue({ nodeId: 'node-001', commandId: 'cmd-123', status: 'pending' })
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
        node: {
          nodeId: 'node-001',
          hwId: 'hw-001',
          displayName: 'Sprout Node',
          claimStatus: 'claimed',
          capability: 'watering',
          registeredAt: 1000,
        },
      },
      global: {
        stubs: {
          NyxCard: { template: '<div><slot name="header" /><slot /></div>' },
          NyxIcon: { template: '<span />' },
          NyxButton: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          NyxActionItem: { template: '<div><slot name="action" /><slot /></div>' },
          NyxInput: { template: '<input />' },
          NyxBadge: { template: '<span><slot /></span>' },
          NyxDropdown: {
            props: ['options'],
            emits: ['select'],
            template: '<div><slot /><button v-for="option in options" :key="option.value" @click="$emit(\'select\', option)">{{ option.label }}</button></div>',
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
    await nextTick()

    expect(applyPowerProfile).toHaveBeenCalledWith('node-001', 'performance')
    expect(wrapper.text()).toContain('Performance')

    await wrapper.findAll('button').find(button => button.text() === 'Pump')?.trigger('click')

    expect(queuePump).toHaveBeenCalledWith('node-001', 100)
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
