import express from 'express'
import cors from 'cors'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createApiRouter } from './routes/createApiRouter.js'
import { LogArchiveService } from './services/LogArchiveService.js'
import { TelemetryService } from './services/TelemetryService.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function resolveCorsOrigins(): Set<string> {
  const configuredOrigins = process.env.ANTHOS_CORS_ORIGINS?.split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0)

  if (configuredOrigins && configuredOrigins.length > 0) {
    return new Set(configuredOrigins)
  }

  return new Set([
    'http://localhost:1440',
    'http://127.0.0.1:1440',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'tauri://localhost',
  ])
}

function resolveStaticDir(): string | null {
  const configuredDir = process.env.ANTHOS_STATIC_DIR?.trim()
  const fallbackDir = join(__dirname, '..', '..', '..', '..', 'app', 'dist')
  const staticDir = configuredDir ? join(configuredDir) : fallbackDir

  return existsSync(join(staticDir, 'index.html')) ? staticDir : null
}

function isSameOriginRequest(req: express.Request): boolean {
  const origin = req.header('origin')
  const host = req.header('host')

  if (!origin || !host) return false

  try {
    const originUrl = new URL(origin)
    return originUrl.host === host
  } catch {
    return false
  }
}

export function createApp(telemetry: TelemetryService, logArchive: LogArchiveService) {
  const app = express()
  const allowedOrigins = resolveCorsOrigins()
  const corsMiddleware = cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('CORS origin not allowed'))
    },
  })

  app.use((req, res, next) => {
    if (isSameOriginRequest(req)) {
      next()
      return
    }

    corsMiddleware(req, res, next)
  })
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
