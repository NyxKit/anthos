import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createApiRouter } from './routes/createApiRouter.js'
import { LogArchiveService } from './services/LogArchiveService.js'
import { TelemetryService } from './services/TelemetryService.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function resolveStaticDir(): string | null {
  const configuredDir = process.env.ANTHOS_STATIC_DIR?.trim()
  const fallbackDir = join(__dirname, '..', '..', '..', '..', 'app', 'dist')
  const staticDir = configuredDir ? join(configuredDir) : fallbackDir

  return existsSync(join(staticDir, 'index.html')) ? staticDir : null
}

export function createApp(telemetry: TelemetryService, logArchive: LogArchiveService) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use('/api', createApiRouter(telemetry, logArchive))

  const staticDir = resolveStaticDir()
  if (staticDir) {
    app.use(express.static(staticDir))
    app.get('*', (_req, res) => {
      res.sendFile(join(staticDir, 'index.html'))
    })
  }

  return app
}
