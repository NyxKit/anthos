import { describe, expect, it, vi } from 'vitest'
import { writeFile } from 'node:fs/promises'

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockRejectedValue(new Error('missing')),
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}))

import { TelemetryService } from '../src/services/TelemetryService.js'

describe('TelemetryService', () => {
  it('persists telemetry immediately instead of buffering it for a minute', async () => {
    const service = new TelemetryService()
    await service.init()

    await service.ingest({
      nodeId: 'node-001',
      hwId: 'hw-001',
      timestampMs: 1,
      health: {
        wifi: 'connected',
        server: 'reachable',
        uptimeMs: 1,
      },
      sensors: [{ type: 'temperature', value: 21.5, unit: 'C' }],
    })

    expect(service.getLatest()).toMatchObject({ nodeId: 'node-001' })
    expect(writeFile).toHaveBeenCalled()
  })
})
