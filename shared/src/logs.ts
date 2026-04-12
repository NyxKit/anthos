export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogArchiveStatus = 'available' | 'unavailable' | 'expired'

export interface LogEntry {
  id: string
  timestampMs: number
  nodeId: string | null
  level: LogLevel
  source: string
  message: string
  meta?: Record<string, unknown>
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
