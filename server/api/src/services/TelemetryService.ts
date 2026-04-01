import { appendFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

import type { TelemetryPayload } from '../../../shared/src/telemetry.js'

export class TelemetryService {
  private latestPayload: TelemetryPayload | null = null

  async ingest(payload: TelemetryPayload): Promise<void> {
    this.latestPayload = payload

    const logsDir = path.resolve(process.cwd(), 'logs')
    const logFile = path.join(logsDir, 'telemetry.ndjson')

    await mkdir(logsDir, { recursive: true })
    await appendFile(logFile, `${JSON.stringify(payload)}\n`, 'utf8')

    console.log('telemetry.ingest', JSON.stringify(payload))
  }

  getLatest(): TelemetryPayload | null {
    return this.latestPayload
  }
}
