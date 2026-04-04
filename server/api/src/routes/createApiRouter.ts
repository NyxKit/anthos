import { Router } from 'express'

import { IngestController } from '../controllers/IngestController.js'
import { TelemetryService } from '../services/TelemetryService.js'

export function createApiRouter(telemetry: TelemetryService): Router {
  const router = Router()

  const ingestController = new IngestController(telemetry)

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  router.get('/readings', (_req, res) => {
    const payload = telemetry.getLatest()
    if (!payload) {
      return res.status(404).json({ error: 'No readings available' })
    }

    res.json({
      node: {
        id: payload.nodeId,
        name: payload.nodeId,
        status: 'connected',
        lastSeen: payload.timestampMs
      },
      readings: payload.sensors.map(s => ({
        nodeId: payload.nodeId,
        timestamp: payload.timestampMs,
        sensor: s.sensor,
        metric: s.metric,
        value: s.value,
        unit: s.unit || ''
      }))
    })
  })

  router.get('/telemetry/latest', ingestController.getLatestTelemetry)
  router.post('/ingest', ingestController.postTelemetry)

  return router
}
