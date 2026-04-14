import { NyxLogEntry, NyxTheme } from 'nyx-kit/types'
import { NyxLoader } from 'nyx-kit/classes'
import type { LogLevel } from '../../logs.js'

export class LogEntry implements NyxLogEntry {
  id: string
  timestamp: Date | number | string
  nodeId: string | null
  level: LogLevel
  source: string
  message: string
  meta?: Record<string, unknown>

  constructor(data?: unknown) {
    if (!data) throw new Error('LogEntry data is required')
    this.id = NyxLoader.loadString(data, 'id')
    this.timestamp = LogEntry.loadTimestamp(data)
    this.nodeId = NyxLoader.loadString(data, 'nodeId')
    this.level = NyxLoader.loadString(data, 'level', 'info') as LogLevel
    this.source = NyxLoader.loadString(data, 'source')
    this.message = NyxLoader.loadString(data, 'message')
    this.meta = NyxLoader.loadObject(data, 'meta', {})
  }

  private static loadTimestamp(data: unknown): Date | number | string {
    if (typeof data !== 'object' || data === null) {
      return Date.now()
    }

    const record = data as Record<string, unknown>
    const timestamp = record['timestamp'] ?? record['timestampMs']

    if (timestamp instanceof Date) return timestamp
    if (typeof timestamp === 'number') return timestamp
    if (typeof timestamp === 'string') return timestamp

    return Date.now()
  }

  get origin(): string {
    return this.source
  }

  get value(): string {
    return this.message
  }

  get theme(): NyxTheme | undefined {
    const SECONDARY_STRINGS = ['pump', 'watering']
    switch (this.level) {
      case 'error':
        return NyxTheme.Danger
      case 'warn':
        return NyxTheme.Warning
      case 'debug':
        return NyxTheme.Primary
      default:
        for (const string of SECONDARY_STRINGS) {
          if (this.message.toLowerCase().includes(string)) return NyxTheme.Secondary
        }
        return undefined
    }
  }
}
