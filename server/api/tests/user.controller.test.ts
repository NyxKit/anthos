import { describe, expect, it, vi } from 'vitest'

import { UserController } from '../src/controllers/UserController.js'

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('UserController', () => {
  it('requires admin access for listing users', async () => {
    const users = { listUsers: vi.fn().mockReturnValue([]) }
    const auth = { requireAdmin: vi.fn().mockRejectedValue(new Error('not_authorized')), getCurrentUser: vi.fn() }
    const controller = new UserController(users as never, auth as never)
    const res = createRes()

    await controller.list({ headers: { authorization: 'Bearer token' } } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'not_authorized' })
    expect(users.listUsers).not.toHaveBeenCalled()
  })

  it('allows admins to update arbitrary users', async () => {
    const users = {
      updateUser: vi.fn().mockReturnValue({ id: 'user-2', username: 'jane', displayName: 'Jane', email: 'jane@example.com', role: 'user' }),
      persist: vi.fn().mockResolvedValue(undefined),
    }
    const auth = { requireAdmin: vi.fn().mockResolvedValue({ id: 'admin-1' }), getCurrentUser: vi.fn() }
    const controller = new UserController(users as never, auth as never)
    const res = createRes()

    await controller.update({
      params: { id: 'user-2' },
      body: { displayName: 'Jane' },
      headers: { authorization: 'Bearer token' },
    } as never, res as never)

    expect(auth.requireAdmin).toHaveBeenCalledWith('token')
    expect(users.updateUser).toHaveBeenCalledWith('user-2', expect.objectContaining({ displayName: 'Jane' }))
    expect(res.json).toHaveBeenCalledWith({ user: { id: 'user-2', username: 'jane', displayName: 'Jane', email: 'jane@example.com', role: 'user' } })
  })

  it('allows admins to delete arbitrary users', async () => {
    const users = {
      deleteUser: vi.fn().mockReturnValue(true),
      persist: vi.fn().mockResolvedValue(undefined),
    }
    const auth = { requireAdmin: vi.fn().mockResolvedValue({ id: 'admin-1' }), getCurrentUser: vi.fn() }
    const controller = new UserController(users as never, auth as never)
    const res = createRes()

    await controller.delete({
      params: { id: 'user-2' },
      headers: { authorization: 'Bearer token' },
    } as never, res as never)

    expect(auth.requireAdmin).toHaveBeenCalledWith('token')
    expect(users.deleteUser).toHaveBeenCalledWith('user-2')
    expect(res.status).toHaveBeenCalledWith(204)
  })
})
