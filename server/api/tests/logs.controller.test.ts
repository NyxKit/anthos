import { mkdtemp, readdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import { LogsController } from '../src/controllers/LogsController.js'
import { LogArchiveService } from '../src/services/LogArchiveService.js'

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
      timestamp: expect.any(Number),
    })
    expect(res.status).toHaveBeenCalledWith(202)
    expect(res.json).toHaveBeenCalledWith({ status: 'accepted', id: 'log-1' })
  })

  it('archives boot, reboot and rollover logs on the receipt day with uptime preserved', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'anthos-device-logs-'))
    vi.stubEnv('ANTHOS_LOG_DIR', directory)
    const receivedAt = Date.UTC(2026, 8, 15, 12)
    const clock = vi.spyOn(Date, 'now').mockReturnValue(receivedAt)
    const service = new LogArchiveService()
    try {
      await service.init()
      const controller = new LogsController(service, {
        getLogicalNode: vi.fn().mockReturnValue({ nodeId: 'node-001', hwId: 'hw-001' }),
        getHardwareNodeWriteToken: vi.fn().mockReturnValue('token-123'),
      } as never)
      for (const time of [
        { timestampMs: 0 },
        { timestampMs: 4294967295 },
        { uptimeMs: 0 },
        { uptimeMs: 42 },
      ]) {
        const res = createRes()
        await controller.create({
          body: {
            nodeId: 'node-001', source: 'power', message: 'cycle',
            meta: { reason: 'test' }, ...time,
          },
          header: vi.fn().mockReturnValue('token-123'),
        } as never, res as never)
        expect(res.status).toHaveBeenCalledWith(202)
      }
      expect(await readdir(directory)).toEqual(['2026-09-15.ndjson'])
      const logs = await service.list({ day: '2026-09-15' })
      expect(logs.items).toHaveLength(4)
      expect(logs.items.every(entry => entry.timestamp === receivedAt)).toBe(true)
      expect(logs.items.map(entry => entry.meta?.['uptimeMs']).sort((a, b) => Number(a) - Number(b)))
        .toEqual([0, 0, 42, 4294967295])
      expect(logs.items.every(entry => entry.meta?.['reason'] === 'test')).toBe(true)
    } finally {
      await service.close()
      clock.mockRestore()
      vi.unstubAllEnvs()
      await rm(directory, { recursive: true, force: true })
    }
  })

  it.each([-1, 0.5, '1000', NaN, Infinity])('rejects invalid uptime %s without writing an archive', async uptimeMs => {
    const logArchive = { recordEntry: vi.fn() }
    const controller = new LogsController(logArchive as never, {
      getLogicalNode: vi.fn().mockReturnValue({ nodeId: 'node-001', hwId: 'hw-001' }),
      getHardwareNodeWriteToken: vi.fn().mockReturnValue('token-123'),
    } as never)
    const res = createRes()
    await controller.create({
      body: { nodeId: 'node-001', source: 'node', message: 'hello', uptimeMs },
      header: vi.fn().mockReturnValue('token-123'),
    } as never, res as never)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(logArchive.recordEntry).not.toHaveBeenCalled()
  })
})
