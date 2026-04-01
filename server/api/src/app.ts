import express from 'express'

import { createApiRouter } from './routes/createApiRouter.js'
import { TelemetryService } from './services/TelemetryService.js'

export function createApp(telemetry: TelemetryService) {
  const app = express()

  app.use(express.json())
  app.use('/api', createApiRouter(telemetry))

  app.get('/', (_req, res) => {
    res.send('Anthos server is running')
  })

  return app
}
