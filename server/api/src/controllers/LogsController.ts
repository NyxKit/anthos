import type { Request, Response, RequestHandler } from 'express'

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

export class LogsController {
  constructor(private readonly logArchive: LogArchiveService) {}

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
