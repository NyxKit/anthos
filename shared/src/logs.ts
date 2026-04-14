import { LogEntry } from './logs/classes/LogEntry.js'

export { LogEntry }

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogArchiveStatus = 'available' | 'unavailable' | 'expired'

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
