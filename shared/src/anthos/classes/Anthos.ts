import { AnthosAlerts } from './AnthosAlerts.js'
import { AnthosLogs } from './AnthosLogs.js'
import { AnthosMetrics } from './AnthosMetrics.js'
import { AnthosNodes } from './AnthosNodes.js'
import { AnthosRooms } from './AnthosRooms.js'
import { AnthosUsers } from './AnthosUsers.js'
import type { AnthosResolvedSetup, AnthosSetupArgs } from '../types.js'

const DEFAULT_API_BASE_URL = 'http://localhost:8088'

export class Anthos {
  private setupState: AnthosResolvedSetup = {
    apiBaseUrl: DEFAULT_API_BASE_URL,
    headers: {},
  }

  readonly nodes: AnthosNodes
  readonly logs: AnthosLogs
  readonly metrics: AnthosMetrics
  readonly rooms: AnthosRooms
  readonly alerts: AnthosAlerts
  readonly users: AnthosUsers

  constructor(setup?: AnthosSetupArgs) {
    this.nodes = new AnthosNodes(this)
    this.logs = new AnthosLogs(this)
    this.metrics = new AnthosMetrics(this)
    this.rooms = new AnthosRooms(this)
    this.alerts = new AnthosAlerts(this)
    this.users = new AnthosUsers(this)

    if (setup) {
      this.setup(setup)
    }
  }

  setup(setup: AnthosSetupArgs): this {
    const headers = { ...(setup.headers ?? {}) }

    if (setup.token) {
      headers.Authorization = `Bearer ${setup.token}`
    }

    this.setupState = {
      apiBaseUrl: setup.apiBaseUrl ?? DEFAULT_API_BASE_URL,
      headers,
    }

    return this
  }

  async request<T>(path: string, options: { method?: 'GET' | 'POST' | 'PATCH'; body?: unknown } = {}): Promise<T> {
    const url = new URL(path, this.setupState.apiBaseUrl)
    const headers: Record<string, string> = { ...this.setupState.headers }

    let body: string | undefined
    if (options.body !== undefined) {
      body = JSON.stringify(options.body)
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }
    }

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body,
    })

    if (!response.ok) {
      throw new Error(`Anthos request failed with status ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>
    }

    return response.text() as Promise<T>
  }
}
