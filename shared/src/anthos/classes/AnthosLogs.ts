import type { LogEntry, LogListFilters, LogListResponse, LogStreamHandle } from '../../logs.js'
import type { Anthos } from './Anthos.js'

type EventSourceConstructor = new (url: string) => {
  addEventListener(type: string, listener: (event: MessageEvent<string>) => void): void
  close(): void
}

export class AnthosLogs {
  constructor(private readonly anthos: Anthos) {}

  list(filters: LogListFilters = {}): Promise<LogListResponse> {
    const params = new URLSearchParams()

    this.appendParam(params, 'nodeId', filters.nodeId)
    this.appendParam(params, 'level', filters.level)
    this.appendParam(params, 'source', filters.source)
    this.appendParam(params, 'q', filters.q)
    this.appendParam(params, 'day', filters.day)
    this.appendParam(params, 'from', filters.from)
    this.appendParam(params, 'to', filters.to)
    this.appendParam(params, 'limit', filters.limit)
    this.appendParam(params, 'before', filters.before)

    const query = params.toString()
    const path = query.length > 0 ? `/api/logs?${query}` : '/api/logs'

    return this.anthos.request<LogListResponse>(path)
  }

  subscribe(filters: LogListFilters, onEntry: (entry: LogEntry) => void, onError?: (error: Event) => void): LogStreamHandle {
    const EventSourceImpl = (globalThis as typeof globalThis & { EventSource?: EventSourceConstructor }).EventSource
    if (!EventSourceImpl) {
      throw new Error('EventSource is not available in this environment')
    }

    const source = new EventSourceImpl(this.buildStreamUrl(filters))

    source.addEventListener('log', event => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as LogEntry
      onEntry(payload)
    })

    if (onError) {
      source.addEventListener('error', onError)
    }

    return {
      close: () => source.close(),
    }
  }

  buildStreamUrl(filters: LogListFilters = {}): string {
    const params = new URLSearchParams()

    this.appendParam(params, 'nodeId', filters.nodeId)
    this.appendParam(params, 'level', filters.level)
    this.appendParam(params, 'source', filters.source)
    this.appendParam(params, 'q', filters.q)
    this.appendParam(params, 'day', filters.day)
    this.appendParam(params, 'from', filters.from)
    this.appendParam(params, 'to', filters.to)

    const query = params.toString()
    return query.length > 0 ? `/api/logs/stream?${query}` : '/api/logs/stream'
  }

  private appendParam(params: URLSearchParams, key: string, value: string | number | undefined): void {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  }
}
