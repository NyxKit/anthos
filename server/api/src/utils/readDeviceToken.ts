import type { Request } from 'express'

export function readDeviceToken(req: Request): string | null {
  const header = typeof req.header === 'function'
    ? req.header('x-anthos-device-token')
    : req.headers?.['x-anthos-device-token']

  const value = Array.isArray(header) ? header[0] : header
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}
