import { Router } from 'express'

import { IngestController } from '../controllers/IngestController.js'
import { CommandController } from '../controllers/CommandController.js'
import { MetricsController } from '../controllers/MetricsController.js'
import { LogsController } from '../controllers/LogsController.js'
import { PowerProfileController } from '../controllers/PowerProfileController.js'
import { ProvisionController } from '../controllers/ProvisionController.js'
import { AuthController } from '../controllers/AuthController.js'
import { UserController } from '../controllers/UserController.js'
import { AutomationController } from '../controllers/AutomationController.js'
import { CommandQueueService } from '../services/CommandQueueService.js'
import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { PairingWindowService } from '../services/PairingWindowService.js'
import { LogArchiveService } from '../services/LogArchiveService.js'
import { TelemetryService } from '../services/TelemetryService.js'
import { AuthService } from '../services/AuthService.js'
import { UserService } from '../services/UserService.js'
import { AutomationService } from '../services/AutomationService.js'
import { AutomationEvaluator } from '../services/AutomationEvaluator.js'

export function createApiRouter(telemetry: TelemetryService, logArchive: LogArchiveService): Router {
  const router = Router()

  const registry = new NodeRegistryService(telemetry.getDb())
  const pairing = new PairingWindowService()
  const saveDb = () => telemetry.saveDbPublic()
  const commandService = new CommandQueueService(telemetry.getDb(), saveDb, logArchive)
  const commandController = new CommandController(commandService, registry, logArchive, saveDb)
  const automationService = new AutomationService(telemetry.getDb(), saveDb, logArchive, registry)
  const automationEvaluator = new AutomationEvaluator(telemetry.getDb(), registry, commandService, automationService, logArchive)
  const automationController = new AutomationController(automationService)
  const ingestController = new IngestController(telemetry, logArchive, registry, automationEvaluator, saveDb)
  const metricsController = new MetricsController(telemetry, registry)
  const logsController = new LogsController(logArchive)
  const provisionCtrl = new ProvisionController(registry, pairing, saveDb)
  const powerProfileCtrl = new PowerProfileController(registry, logArchive, commandService, saveDb)
  const users = new UserService(telemetry.getDb(), saveDb)
  const auth = new AuthService(telemetry.getDb(), users, saveDb)
  const authCtrl = new AuthController(auth)
  const userCtrl = new UserController(users, auth)

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

  router.get('/telemetry/latest-by-node', ingestController.getLatestTelemetryByNode)
  router.post('/ingest', ingestController.postTelemetry)

  router.get('/metrics', metricsController.getDashboardMetrics)

  router.get('/nodes/:nodeId/commands', commandController.listPending)
  router.post('/nodes/:nodeId/commands', commandController.enqueuePump)
  router.post('/nodes/:nodeId/commands/:commandId/ack', commandController.acknowledge)

  router.get('/logs', logsController.list)
  router.get('/logs/stream', logsController.stream)

  router.get('/automations', automationController.list)
  router.post('/automations', automationController.create)
  router.patch('/automations/:automationId', automationController.update)
  router.delete('/automations/:automationId', automationController.delete)

  router.post('/auth/login', authCtrl.login)
  router.post('/auth/logout', authCtrl.logout)
  router.get('/auth/me', authCtrl.me)

  router.get('/users/setup-status', userCtrl.setupStatus)
  router.get('/users', userCtrl.list)
  router.get('/users/me', userCtrl.me)
  router.patch('/users/me', userCtrl.updateMe)
  router.delete('/users/me', userCtrl.deleteMe)
  router.get('/users/:id', userCtrl.get)
  router.post('/users', userCtrl.create)
  router.patch('/users/:id', userCtrl.update)
  router.delete('/users/:id', userCtrl.delete)

  router.post('/register', provisionCtrl.register)
  router.post('/provision/open', provisionCtrl.openProvisionWindow)
  router.get('/provision/status', provisionCtrl.getProvisionStatus)
  router.get('/nodes', provisionCtrl.listNodes)
  router.patch('/nodes/:id/capability', provisionCtrl.updateCapability)
  router.patch('/nodes/:id/name', provisionCtrl.updateDisplayName)
  router.patch('/nodes/:id/order', provisionCtrl.updateOrder)
  router.get('/nodes/:id/power-profile', powerProfileCtrl.getNodeProfile)
  router.patch('/nodes/:id/power-profile', powerProfileCtrl.applyProfile)

  return router
}
