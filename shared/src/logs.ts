import { LogEntry } from './logs/classes/LogEntry.js'

export { LogEntry }

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogArchiveStatus = 'available' | 'unavailable' | 'expired'

/** Device logs use hub receipt time for archival; uptime is boot-relative. */
export interface DeviceLogRequest {
  nodeId: string
  source: string
  message: string
  level?: LogLevel
  meta?: Record<string, unknown>
  uptimeMs?: number
  /** Legacy firmware alias for uptime, never Unix epoch time. */
  timestampMs?: number
}

export enum DeviceLogStatus {
  Accepted = 'accepted',
}

export interface DeviceLogResponse {
  status: DeviceLogStatus.Accepted
  id: string
}

export interface LogListFilters {
  nodeId?: string
  level?: LogLevel
  source?: string
  q?: string
  from?: number
  to?: number
  day?: string
  limit?: number
  before?: string
}

export interface LogListResponse {
  items: LogEntry[]
  nextCursor: string | null
  hasMore: boolean
  archiveStatus?: LogArchiveStatus
  day?: string | null
}

export interface LogStreamHandle {
  close(): void
}
