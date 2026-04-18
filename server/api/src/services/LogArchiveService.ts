import { randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'

import { LogEntry, type LogArchiveStatus, type LogListFilters, type LogListResponse, type LogLevel } from '@anthos/shared'
import type { TelemetryPayload } from '@anthos/shared/nodes/types'

type LogListener = {
  filters: LogListFilters
  onEntry: (entry: LogEntry) => void
}

type LogEntryInput = {
  nodeId: string | null
  level: LogLevel
  source: string
  message: string
  meta?: Record<string, unknown>
  timestamp?: number
}

const DEFAULT_LIMIT = 100
const DEFAULT_RETENTION_DAYS = 30
const ARCHIVE_PATTERN = /^\d{4}-\d{2}-\d{2}\.ndjson$/

export class LogArchiveService {
  private readonly logDir = path.resolve(process.cwd(), 'logs')
  private readonly retentionDays = DEFAULT_RETENTION_DAYS
  private readonly listeners = new Set<LogListener>()

  async init(): Promise<void> {
    await mkdir(this.logDir, { recursive: true })
    await this.pruneExpiredArchives()
  }

  async close(): Promise<void> {
    this.listeners.clear()
  }

  async recordTelemetry(payload: TelemetryPayload): Promise<LogEntry> {
    const entry = this.buildTelemetryEntry(payload)
    await this.append(entry)
    this.emit(entry)
    return entry
  }

  async recordEntry(entry: LogEntryInput): Promise<LogEntry> {
    const fullEntry = new LogEntry({
      id: randomUUID(),
      timestamp: entry.timestamp ?? Date.now(),
      nodeId: entry.nodeId,
      level: entry.level,
      source: entry.source,
      message: entry.message,
      meta: entry.meta,
    })

    await this.append(fullEntry)
    this.emit(fullEntry)
    return fullEntry
  }

  async list(filters: LogListFilters = {}): Promise<LogListResponse> {
    const limit = this.normalizeLimit(filters.limit)

    if (filters.day) {
      return this.listForDay(filters.day, filters, limit)
    }

    const days = await this.getRecentDays()
    const entries = await this.loadEntries(days)
    const filtered = this.filterEntries(entries, filters)
    const page = this.paginate(filtered, filters.before, limit)

    return {
      items: page.items,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      archiveStatus: 'available',
      day: null,
    }
  }

  subscribe(filters: LogListFilters, onEntry: (entry: LogEntry) => void): () => void {
    const listener: LogListener = { filters, onEntry }
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  private async listForDay(day: string, filters: LogListFilters, limit: number): Promise<LogListResponse> {
    const normalizedDay = this.normalizeDay(day)
    if (!normalizedDay) {
      return { items: [], nextCursor: null, hasMore: false, archiveStatus: 'unavailable', day }
    }

    const status = await this.getArchiveStatus(normalizedDay)
    if (status !== 'available') {
      return { items: [], nextCursor: null, hasMore: false, archiveStatus: status, day: normalizedDay }
    }

    const entries = await this.readArchive(normalizedDay)
    const filtered = this.filterEntries(entries, filters)
    const page = this.paginate(filtered, filters.before, limit)

    return {
      items: page.items,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      archiveStatus: status,
      day: normalizedDay,
    }
  }

  private buildTelemetryEntry(payload: TelemetryPayload): LogEntry {
    const message = payload.sensors.length === 0
      ? 'Telemetry received'
      : `Telemetry received: ${payload.sensors.map(sensor => `${sensor.type}=${sensor.value}${sensor.unit ?? ''}`).join(', ')}`

    return new LogEntry({
      id: randomUUID(),
      timestamp: payload.timestampMs,
      nodeId: payload.nodeId,
      level: 'info',
      source: payload.nodeId,
      message,
      meta: {
        health: payload.health,
        sensors: payload.sensors,
      },
    })
  }

  private async append(entry: LogEntry): Promise<void> {
    await mkdir(this.logDir, { recursive: true })

    const archivePath = this.archivePathForTimestamp(this.resolveTimestamp(entry))
    await writeFile(archivePath, `${JSON.stringify(entry)}\n`, { flag: 'a' })
  }

  private emit(entry: LogEntry): void {
    for (const listener of this.listeners) {
      if (this.matchesFilters(entry, listener.filters)) {
        listener.onEntry(entry)
      }
    }
  }

  private async getArchiveStatus(day: string): Promise<LogArchiveStatus> {
    if (!this.isWithinRetention(day)) {
      return 'expired'
    }

    try {
      await readFile(this.archivePathForDay(day))
      return 'available'
    } catch {
      return 'unavailable'
    }
  }

  private async getRecentDays(): Promise<string[]> {
    const days: string[] = []
    for (let offset = 0; offset < this.retentionDays; offset += 1) {
      days.push(this.dayForOffset(offset))
    }

    return days
  }

  private async pruneExpiredArchives(): Promise<void> {
    const entries = await readdir(this.logDir, { withFileTypes: true }).catch(() => [])
    const cutoff = this.dayForOffset(this.retentionDays - 1)

    await Promise.all(entries.map(async entry => {
      if (!entry.isFile() || !ARCHIVE_PATTERN.test(entry.name)) return
      const day = entry.name.slice(0, 10)
      if (day >= cutoff) return
      await unlink(path.join(this.logDir, entry.name)).catch(() => undefined)
    }))
  }

  private async loadEntries(days: string[]): Promise<LogEntry[]> {
    const archives = await Promise.all(days.map(async day => this.readArchive(day).catch(() => [] as LogEntry[])))
    return archives.flat()
  }

  private async readArchive(day: string): Promise<LogEntry[]> {
    const filePath = this.archivePathForDay(day)
    const content = await readFile(filePath, 'utf8')
    const lines = content.split('\n').filter(line => line.trim().length > 0)

    return lines.flatMap(line => {
      try {
        const parsed = JSON.parse(line) as Partial<LogEntry>
        if (!this.isLogEntry(parsed)) return []
        return [new LogEntry({
          id: parsed.id,
          timestamp: this.resolveTimestamp(parsed),
          nodeId: parsed.nodeId,
          level: parsed.level,
          source: parsed.source,
          message: parsed.message,
          meta: parsed.meta,
        })]
      } catch {
        return []
      }
    }) as LogEntry[]
  }

  private filterEntries(entries: LogEntry[], filters: LogListFilters): LogEntry[] {
    return entries.filter(entry => this.matchesFilters(entry, filters))
  }

  private paginate(entries: LogEntry[], before: string | undefined, limit: number): { items: LogEntry[]; nextCursor: string | null; hasMore: boolean } {
    const sorted = [...entries].sort((left, right) => this.compareEntries(right, left))
    const cursor = before ? this.decodeCursor(before) : null
    const sliced = cursor ? sorted.filter(entry => this.isOlderThanCursor(entry, cursor)) : sorted
    const items = sliced.slice(0, limit)
    const hasMore = sliced.length > limit
    const nextCursor = hasMore && items.length > 0 ? this.encodeCursor(items[items.length - 1]!) : null

    return { items, nextCursor, hasMore }
  }

  private matchesFilters(entry: LogEntry, filters: LogListFilters): boolean {
    if (filters.nodeId && entry.nodeId !== filters.nodeId) return false
    if (filters.level && entry.level !== filters.level) return false
    if (filters.source && entry.source !== filters.source) return false
    const timestamp = this.resolveTimestamp(entry)
    if (filters.from !== undefined && timestamp < filters.from) return false
    if (filters.to !== undefined && timestamp > filters.to) return false

    const query = filters.q?.trim().toLowerCase()
    if (query) {
      const haystack = [entry.nodeId ?? '', entry.source, entry.message, JSON.stringify(entry.meta ?? {})].join(' ').toLowerCase()
      if (!haystack.includes(query)) return false
    }

    return true
  }

  private isLogEntry(value: Partial<LogEntry>): value is LogEntry {
    return typeof value.id === 'string'
      && (typeof value.timestamp === 'number'
        || typeof value.timestamp === 'string'
        || value.timestamp instanceof Date
        || typeof (value as { timestampMs?: unknown }).timestampMs === 'number')
      && (typeof value.nodeId === 'string' || value.nodeId === null)
      && this.isLogLevel(value.level)
      && typeof value.source === 'string'
      && typeof value.message === 'string'
  }

  private isLogLevel(value: unknown): value is LogLevel {
    return value === 'debug' || value === 'info' || value === 'warn' || value === 'error'
  }

  private compareEntries(left: LogEntry, right: LogEntry): number {
    const leftTimestamp = this.resolveTimestamp(left)
    const rightTimestamp = this.resolveTimestamp(right)
    if (leftTimestamp !== rightTimestamp) return leftTimestamp - rightTimestamp
    return left.id.localeCompare(right.id)
  }

  private encodeCursor(entry: LogEntry): string {
    return Buffer.from(JSON.stringify({ timestamp: this.resolveTimestamp(entry), id: entry.id }), 'utf8').toString('base64url')
  }

  private decodeCursor(cursor: string): { timestamp: number; id: string } | null {
    try {
      const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as { timestamp?: number; timestampMs?: number; id?: string }
      const timestamp = typeof parsed.timestamp === 'number' ? parsed.timestamp : parsed.timestampMs
      if (typeof timestamp !== 'number' || typeof parsed.id !== 'string') return null
      return { timestamp, id: parsed.id }
    } catch {
      return null
    }
  }

  private isOlderThanCursor(entry: LogEntry, cursor: { timestamp: number; id: string }): boolean {
    const timestamp = this.resolveTimestamp(entry)
    if (timestamp !== cursor.timestamp) {
      return timestamp < cursor.timestamp
    }

    return entry.id < cursor.id
  }

  private normalizeLimit(limit: number | undefined): number {
    if (!limit || Number.isNaN(limit)) return DEFAULT_LIMIT
    return Math.max(1, Math.min(limit, 500))
  }

  private normalizeDay(value: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
    return value
  }

  private isWithinRetention(day: string): boolean {
    return day >= this.dayForOffset(this.retentionDays - 1)
  }

  private dayForOffset(offsetDays: number): string {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - offsetDays)
    return date.toISOString().slice(0, 10)
  }

  private archivePathForTimestamp(timestamp: number): string {
    return this.archivePathForDay(this.dayForTimestamp(timestamp))
  }

  private archivePathForDay(day: string): string {
    return path.join(this.logDir, `${day}.ndjson`)
  }

  private dayForTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString().slice(0, 10)
  }

  private resolveTimestamp(entry: Partial<LogEntry> & { timestampMs?: unknown }): number {
    if (typeof entry.timestamp === 'number') return entry.timestamp
    if (typeof entry.timestamp === 'string') return new Date(entry.timestamp).getTime()
    if (entry.timestamp instanceof Date) return entry.timestamp.getTime()
    if (typeof entry.timestampMs === 'number') return entry.timestampMs
    return Date.now()
  }
}
