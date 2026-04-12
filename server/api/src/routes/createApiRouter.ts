import { Router } from 'express'

import { IngestController } from '../controllers/IngestController.js'
import { MetricsController } from '../controllers/MetricsController.js'
import { LogsController } from '../controllers/LogsController.js'
import { ProvisionController } from '../controllers/ProvisionController.js'
import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { PairingWindowService } from '../services/PairingWindowService.js'
import { LogArchiveService } from '../services/LogArchiveService.js'
import { TelemetryService } from '../services/TelemetryService.js'

export function createApiRouter(telemetry: TelemetryService, logArchive: LogArchiveService): Router {
  const router = Router()

  const registry = new NodeRegistryService(telemetry.getDb())
  const pairing = new PairingWindowService()
  const ingestController = new IngestController(telemetry, logArchive, registry)
  const metricsController = new MetricsController(telemetry, registry)
  const logsController = new LogsController(logArchive)
  const provisionCtrl = new ProvisionController(registry, pairing, () => telemetry.saveDbPublic())

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
        sensor: s.type,
        value: s.value,
        unit: s.unit || ''
      }))
    })
  })

  router.get('/telemetry/latest', ingestController.getLatestTelemetry)
  router.post('/ingest', ingestController.postTelemetry)

  router.get('/metrics', metricsController.getDashboardMetrics)

  router.get('/logs', logsController.list)
  router.get('/logs/stream', logsController.stream)

  router.post('/register', provisionCtrl.register)
  router.post('/provision/open', provisionCtrl.openProvisionWindow)
  router.get('/provision/status', provisionCtrl.getProvisionStatus)
  router.get('/nodes', provisionCtrl.listNodes)
  router.patch('/nodes/:id', provisionCtrl.claimNode)

  return router
}
