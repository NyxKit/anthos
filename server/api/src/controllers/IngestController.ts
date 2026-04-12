import type { Request, Response } from 'express'

import type { TelemetryPayload } from '@anthos/shared'
import { TelemetryService } from '../services/TelemetryService.js'
import { LogArchiveService } from '../services/LogArchiveService.js'

export class IngestController {
  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly logArchive: LogArchiveService
  ) {}

  getLatestTelemetry = (_req: Request, res: Response): void => {
    const payload = this.telemetryService.getLatest()
    if (!payload) {
      res.status(404).json({ error: 'No telemetry received yet' })
      return
    }

    res.json(payload)
  }

  postTelemetry = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as TelemetryPayload

    if (!payload?.nodeId || !Array.isArray(payload?.sensors) || !payload?.health) {
      res.status(400).json({ error: 'Invalid telemetry payload' })
      return
    }

    await this.telemetryService.ingest(payload)
    await this.logArchive.recordTelemetry(payload).catch(error => {
      console.error('log.archive.record.failed', error)
    })

    res.status(202).json({ status: 'accepted' })
  }
}
