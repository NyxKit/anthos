import { describe, expect, it, vi } from 'vitest'

import { LogsController } from '../src/controllers/LogsController.js'

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('LogsController', () => {
  it('rejects log writes without a device token', async () => {
    const controller = new LogsController(
      { recordEntry: vi.fn(), recordTelemetry: vi.fn() } as never,
      { getLogicalNode: vi.fn(), getHardwareNodeWriteToken: vi.fn() } as never
    )
    const res = createRes()

    await controller.create({ body: { nodeId: 'node-001', source: 'node', message: 'hello' }, header: vi.fn().mockReturnValue(undefined) } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'device_token_required' })
  })

  it('records log entries for an authenticated node', async () => {
    const logArchive = { recordEntry: vi.fn().mockResolvedValue({ id: 'log-1' }), recordTelemetry: vi.fn() }
    const registry = {
      getLogicalNode: vi.fn().mockReturnValue({ nodeId: 'node-001', hwId: 'hw-001' }),
      getHardwareNodeWriteToken: vi.fn().mockReturnValue('token-123'),
    }
    const controller = new LogsController(logArchive as never, registry as never)
    const res = createRes()

    await controller.create({
      body: { nodeId: 'node-001', source: 'node', message: 'hello', level: 'info' },
      header: vi.fn(name => (name === 'x-anthos-device-token' ? 'token-123' : undefined)),
    } as never, res as never)

    expect(logArchive.recordEntry).toHaveBeenCalledWith({
      nodeId: 'node-001',
      level: 'info',
      source: 'node',
      message: 'hello',
      meta: undefined,
      timestamp: undefined,
    })
    expect(res.status).toHaveBeenCalledWith(202)
    expect(res.json).toHaveBeenCalledWith({ status: 'accepted', id: 'log-1' })
  })
})
