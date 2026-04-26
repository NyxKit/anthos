import { describe, expect, it, vi } from 'vitest'

import { createBleNotifySubscription } from './useBleProvisioning'

describe('createBleNotifySubscription', () => {
  it('removes the listener when unsubscribed', () => {
    const callback = vi.fn()
    const unsubscribe = createBleNotifySubscription('test-char', callback)

    window.dispatchEvent(new CustomEvent('blec:notify:test-char', { detail: [1, 2, 3] }))
    expect(callback).toHaveBeenCalledWith([1, 2, 3])

    callback.mockClear()
    unsubscribe()

    window.dispatchEvent(new CustomEvent('blec:notify:test-char', { detail: [4, 5, 6] }))
    expect(callback).not.toHaveBeenCalled()
  })
})
