import { Router } from 'express'

import { IngestController } from '../controllers/IngestController.js'
import { TelemetryService } from '../services/TelemetryService.js'

export function createApiRouter(telemetry: TelemetryService): Router {
  const router = Router()

  const ingestController = new IngestController(telemetry)

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  router.get('/telemetry/latest', ingestController.getLatestTelemetry)
  router.post('/ingest', ingestController.postTelemetry)

  return router
}
