import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  subscribe: vi.fn(() => ({ close: vi.fn() })),
}))

vi.mock('@anthos/shared/anthos', () => ({
  default: {
    logs: {
      list: mocks.list,
      subscribe: mocks.subscribe,
    },
  },
}))

import { useLogStore } from './logs'

describe('useLogStore retention states', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mocks.list.mockReset()
    mocks.subscribe.mockReset()
    mocks.subscribe.mockReturnValue({ close: vi.fn() })
  })

  it('surfaces expired and unavailable archive states', async () => {
    mocks.list.mockResolvedValueOnce({
      items: [],
      nextCursor: null,
      hasMore: false,
      archiveStatus: 'expired',
      day: '2026-03-01',
    })

    const store = useLogStore()
    await store.setDay('2026-03-01')

    expect(store.archiveStatus).toBe('expired')

    mocks.list.mockResolvedValueOnce({
      items: [],
      nextCursor: null,
      hasMore: false,
      archiveStatus: 'unavailable',
      day: '2026-04-01',
    })

    await store.setDay('2026-04-01')

    expect(store.archiveStatus).toBe('unavailable')
  })
})
