import express from 'express'
import cors from 'cors'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createApiRouter } from './routes/createApiRouter.js'
import { TelemetryService } from './services/TelemetryService.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function createApp(telemetry: TelemetryService) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use('/api', createApiRouter(telemetry))

  // Serve the built frontend (app/dist/) — only present in production
  const distPath = join(__dirname, '..', '..', '..', '..', 'app', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })

  return app
}
