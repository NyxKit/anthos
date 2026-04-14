import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { LogArchiveService } from '../src/services/LogArchiveService.js'

describe('LogArchiveService retention', () => {
  let cwd: string
  let tempDir: string

  beforeEach(async () => {
    cwd = process.cwd()
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'anthos-logs-retention-'))
    process.chdir(tempDir)
    await mkdir(path.join(tempDir, 'logs'), { recursive: true })
  })

  afterEach(async () => {
    process.chdir(cwd)
    await rm(tempDir, { recursive: true, force: true })
  })

  it('removes archives older than the retention window on startup', async () => {
    const logsDir = path.join(process.cwd(), 'logs')
    const expiredDay = new Date()
    expiredDay.setUTCDate(expiredDay.getUTCDate() - 31)
    const expiredName = `${expiredDay.toISOString().slice(0, 10)}.ndjson`

    await writeFile(path.join(logsDir, expiredName), '{"id":"1","timestamp":1,"nodeId":"node-001","level":"info","source":"node-001","message":"old"}\n')

    const service = new LogArchiveService()
    await service.init()

    await expect(readFile(path.join(logsDir, expiredName))).rejects.toThrow()
  })
})
