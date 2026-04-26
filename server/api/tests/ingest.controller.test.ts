import { describe, expect, it, vi } from 'vitest'

import { IngestController } from '../src/controllers/IngestController.js'

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('IngestController', () => {
  it('rejects telemetry without a device token', async () => {
    const controller = new IngestController(
      { ingest: vi.fn() } as never,
      { recordTelemetry: vi.fn(), recordEntry: vi.fn() } as never,
      { upsertHardwareNode: vi.fn(), getHardwareNodeWriteToken: vi.fn(), findLogicalNodeByHwId: vi.fn(), createLogicalNode: vi.fn(), getLogicalNode: vi.fn() } as never,
      { evaluateTelemetry: vi.fn() } as never
    )
    const res = createRes()

    await controller.postTelemetry({ body: { nodeId: 'node-001', hwId: 'hw-001', sensors: [], health: {} }, header: vi.fn().mockReturnValue(undefined) } as never, res as never)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'device_token_required' })
  })

  it('accepts telemetry with a matching device token', async () => {
    const telemetry = { ingest: vi.fn().mockResolvedValue(undefined), getLatestByNode: vi.fn() }
    const logArchive = { recordTelemetry: vi.fn().mockResolvedValue(undefined), recordEntry: vi.fn() }
    const registry = {
      upsertHardwareNode: vi.fn().mockResolvedValue(undefined),
      getHardwareNodeWriteToken: vi.fn().mockReturnValue('token-123'),
      findLogicalNodeByHwId: vi.fn().mockReturnValue({ nodeId: 'node-001', capability: 'earth' }),
      createLogicalNode: vi.fn(),
      getLogicalNode: vi.fn().mockReturnValue({ capability: 'earth' }),
    }
    const automations = { evaluateTelemetry: vi.fn().mockResolvedValue(undefined) }
    const controller = new IngestController(telemetry as never, logArchive as never, registry as never, automations as never)
    const res = createRes()

    await controller.postTelemetry({
      body: {
        nodeId: 'node-001',
        hwId: 'hw-001',
        sensors: [{ type: 'temperature', value: 20, unit: 'C' }],
        health: { wifi: 'ok' },
      },
      header: vi.fn(name => (name === 'x-anthos-device-token' ? 'token-123' : undefined)),
    } as never, res as never)

    expect(registry.upsertHardwareNode).toHaveBeenCalledWith('hw-001')
    expect(telemetry.ingest).toHaveBeenCalled()
    expect(logArchive.recordTelemetry).toHaveBeenCalled()
    expect(automations.evaluateTelemetry).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(202)
  })
})
