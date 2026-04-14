import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { LogArchiveService } from '../src/services/LogArchiveService.js'

describe('LogArchiveService live stream', () => {
  let cwd: string
  let tempDir: string

  beforeEach(async () => {
    cwd = process.cwd()
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'anthos-logs-live-'))
    process.chdir(tempDir)
    await mkdir(path.join(tempDir, 'logs'), { recursive: true })
  })

  afterEach(async () => {
    process.chdir(cwd)
    await rm(tempDir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('records telemetry and emits live updates', async () => {
    const service = new LogArchiveService()
    await service.init()

    const onEntry = vi.fn()
    const unsubscribe = service.subscribe({}, onEntry)

    const entry = await service.recordTelemetry({
      nodeId: 'node-001',
      hwId: 'ABCDEF123456',
      timestampMs: Date.now(),
      health: {
        wifi: 'ok',
        ip: '192.168.1.2',
        rssi: -42,
        server: 'anthos',
        target: 'hub',
        uptimeMs: 10,
      },
      sensors: [{ type: 'temperature', value: 22.4, unit: 'C' }],
    })

    expect(entry.nodeId).toBe('node-001')
    expect(entry.message).toContain('temperature=22.4C')
    expect(onEntry).toHaveBeenCalledWith(entry)

    unsubscribe()
  })
})
