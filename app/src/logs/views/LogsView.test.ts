import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const store = {
  entries: [],
  nodeId: '',
  source: '',
  level: '',
  query: '',
  selectedDay: null,
  isLoading: false,
  error: null,
  archiveStatus: 'available',
  hasMore: false,
  isLive: true,
  visibleCount: 0,
  start: vi.fn(),
  setDay: vi.fn(),
  applyFilters: vi.fn(),
  clearFilters: vi.fn(),
  loadOlder: vi.fn(),
}

vi.mock('@/logs/stores/logs', () => ({
  useLogStore: () => store,
}))

import LogsView from './LogsView.vue'

describe('LogsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    store.start.mockReset()
    store.setDay.mockReset()
    store.applyFilters.mockReset()
    store.clearFilters.mockReset()
    store.loadOlder.mockReset()
  })

  it('wires controls to the logs store', async () => {
    const wrapper = mount(LogsView, {
      global: {
        stubs: {
          NyxLogViewer: { template: '<div data-test="viewer"></div>' },
          NyxBadge: { template: '<span><slot /></span>' },
        },
      },
    })

    expect(store.start).toHaveBeenCalled()
    await wrapper.find('input[type="date"]').setValue('2026-04-11')
    expect(store.setDay).toHaveBeenCalledWith('2026-04-11')

    await wrapper.findAll('button').find(button => button.text() === 'Apply')?.trigger('click')
    expect(store.applyFilters).toHaveBeenCalled()

    await wrapper.findAll('button').find(button => button.text() === 'Reset')?.trigger('click')
    expect(store.clearFilters).toHaveBeenCalled()
  })
})
