import type { Request, Response, RequestHandler } from 'express'
import { DeviceLogStatus, type DeviceLogRequest, type DeviceLogResponse } from '@anthos/shared'

import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { LogArchiveService } from '../services/LogArchiveService.js'

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const parseOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.trim() === '') return undefined
  return value
}

const readDeviceToken = (req: Request): string | null => {
  const header = typeof req.header === 'function'
    ? req.header('x-anthos-device-token')
    : req.headers?.['x-anthos-device-token']

  const value = Array.isArray(header) ? header[0] : header
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

export class LogsController {
  constructor(
    private readonly logArchive: LogArchiveService,
    private readonly registry: NodeRegistryService
  ) {}

  create: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const receivedAt = Date.now()
    const body = req.body as Partial<Record<keyof DeviceLogRequest, unknown>>

    const nodeId = parseOptionalString(body.nodeId)
    const deviceToken = readDeviceToken(req)

    if (!nodeId) {
      res.status(400).json({ error: 'nodeId is required' })
      return
    }

    if (!deviceToken) {
      res.status(401).json({ error: 'device_token_required' })
      return
    }

    const node = this.registry.getLogicalNode(nodeId)
    if (!node) {
      res.status(403).json({ error: 'not_authorized' })
      return
    }

    const storedToken = this.registry.getHardwareNodeWriteToken(node.hwId)
    if (!storedToken || storedToken !== deviceToken) {
      res.status(403).json({ error: 'not_authorized' })
      return
    }

    const source = parseOptionalString(body.source)
    const message = parseOptionalString(body.message)
    const level = parseOptionalString(body.level) as 'debug' | 'info' | 'warn' | 'error' | undefined

    if (!source || !message) {
      res.status(400).json({ error: 'Invalid log payload' })
      return
    }

    const uptimeMs = body.uptimeMs ?? body.timestampMs
    if (uptimeMs !== undefined &&
        (typeof uptimeMs !== 'number' || !Number.isSafeInteger(uptimeMs) || uptimeMs < 0)) {
      res.status(400).json({ error: 'Invalid log uptime' })
      return
    }
    const meta = typeof body.meta === 'object' && body.meta !== null && !Array.isArray(body.meta)
      ? body.meta as Record<string, unknown>
      : undefined

    const entry = await this.logArchive.recordEntry({
      nodeId: parseOptionalString(body.nodeId) ?? null,
      level: level ?? 'info',
      source,
      message,
      meta: uptimeMs === undefined ? meta : { ...meta, uptimeMs },
      timestamp: receivedAt,
    })

    res.status(202).json({ status: DeviceLogStatus.Accepted, id: entry.id } satisfies DeviceLogResponse)
  }

  list: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const response = await this.logArchive.list({
      nodeId: parseOptionalString(req.query['nodeId']),
      level: parseOptionalString(req.query['level']) as 'debug' | 'info' | 'warn' | 'error' | undefined,
      source: parseOptionalString(req.query['source']),
      q: parseOptionalString(req.query['q']),
      day: parseOptionalString(req.query['day']),
      from: parseOptionalNumber(req.query['from']),
      to: parseOptionalNumber(req.query['to']),
      limit: parseOptionalNumber(req.query['limit']),
      before: parseOptionalString(req.query['before']),
    })

    res.json(response)
  }

  stream: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    res.status(200)
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders?.()
    res.write('retry: 5000\n\n')

    const unsubscribe = this.logArchive.subscribe({
      nodeId: parseOptionalString(req.query['nodeId']),
      level: parseOptionalString(req.query['level']) as 'debug' | 'info' | 'warn' | 'error' | undefined,
      source: parseOptionalString(req.query['source']),
      q: parseOptionalString(req.query['q']),
      day: parseOptionalString(req.query['day']),
      from: parseOptionalNumber(req.query['from']),
      to: parseOptionalNumber(req.query['to']),
    }, entry => {
      res.write(`event: log\ndata: ${JSON.stringify(entry)}\n\n`)
    })

    const cleanup = () => {
      unsubscribe()
      res.end()
    }

    req.on('close', cleanup)
    req.on('aborted', cleanup)
  }
}
