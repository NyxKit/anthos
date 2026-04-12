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

describe('useLogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mocks.list.mockReset()
    mocks.subscribe.mockReset()
    mocks.subscribe.mockReturnValue({ close: vi.fn() })
  })

  it('loads the latest logs and attaches a live stream', async () => {
    mocks.list.mockResolvedValue({
      items: [
        { id: '1', timestampMs: 1000, nodeId: 'node-001', level: 'info', source: 'node-001', message: 'first' },
      ],
      nextCursor: 'cursor-1',
      hasMore: true,
      archiveStatus: 'available',
      day: null,
    })

    const store = useLogStore()
    await store.start()

    expect(store.entries).toHaveLength(1)
    expect(store.isLive).toBe(true)
    expect(mocks.list).toHaveBeenCalled()
    expect(mocks.subscribe).toHaveBeenCalled()

    const liveCall = mocks.subscribe.mock.calls[0] as unknown as [unknown, (entry: { id: string; timestampMs: number; nodeId: string; level: 'info'; source: string; message: string }) => void]
    const liveCallback = liveCall[1]
    liveCallback({ id: '2', timestampMs: 2000, nodeId: 'node-001', level: 'info', source: 'node-001', message: 'live' })

    expect(store.entries[0]?.id).toBe('2')
  })

  it('loads older entries using the cursor and switches to a specific day', async () => {
    mocks.list.mockResolvedValueOnce({
      items: [
        { id: '2', timestampMs: 2000, nodeId: 'node-001', level: 'info', source: 'node-001', message: 'newer' },
      ],
      nextCursor: 'cursor-2',
      hasMore: true,
      archiveStatus: 'available',
      day: null,
    })

    mocks.list.mockResolvedValueOnce({
      items: [
        { id: '1', timestampMs: 1000, nodeId: 'node-001', level: 'info', source: 'node-001', message: 'older' },
      ],
      nextCursor: null,
      hasMore: false,
      archiveStatus: 'available',
      day: null,
    })

    mocks.list.mockResolvedValueOnce({
      items: [],
      nextCursor: null,
      hasMore: false,
      archiveStatus: 'available',
      day: '2026-04-11',
    })

    const store = useLogStore()
    await store.start()
    await store.loadOlder()

    expect(store.entries.map(entry => entry.id)).toEqual(['2', '1'])

    await store.setDay('2026-04-11')
    expect(store.selectedDay).toBe('2026-04-11')
    expect(store.isLive).toBe(false)
  })
})
