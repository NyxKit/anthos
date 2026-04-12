import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { LogArchiveService } from '../src/services/LogArchiveService.js'

describe('LogArchiveService history', () => {
  let cwd: string
  let tempDir: string

  beforeEach(async () => {
    cwd = process.cwd()
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'anthos-logs-history-'))
    process.chdir(tempDir)
    await mkdir(path.join(tempDir, 'logs'), { recursive: true })
  })

  afterEach(async () => {
    process.chdir(cwd)
    await rm(tempDir, { recursive: true, force: true })
  })

  it('paginates history and filters by node id', async () => {
    const service = new LogArchiveService()
    await service.init()

    const now = Date.now()
    await service.recordTelemetry({
      nodeId: 'node-001',
      timestampMs: now,
      health: { wifi: 'ok', ip: '1.1.1.1', rssi: -40, server: 'anthos', target: 'hub', uptimeMs: 1 },
      sensors: [{ type: 'temperature', value: 21, unit: 'C' }],
    })

    await service.recordTelemetry({
      nodeId: 'node-002',
      timestampMs: now + 1000,
      health: { wifi: 'ok', ip: '1.1.1.2', rssi: -41, server: 'anthos', target: 'hub', uptimeMs: 2 },
      sensors: [{ type: 'temperature', value: 22, unit: 'C' }],
    })

    const page = await service.list({ limit: 1 })
    expect(page.items).toHaveLength(1)
    expect(page.hasMore).toBe(true)
    expect(page.nextCursor).toBeTruthy()

    const older = await service.list({ limit: 1, before: page.nextCursor ?? undefined })
    expect(older.items).toHaveLength(1)

    const filtered = await service.list({ nodeId: 'node-001' })
    expect(filtered.items.every(entry => entry.nodeId === 'node-001')).toBe(true)
  })
})
