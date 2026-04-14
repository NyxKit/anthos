import type { LogicalNodeRecord, TelemetryPayload } from '../../telemetry.js'
import type { QueuePumpCommandRequest } from '../../commands.js'
import type { Anthos } from './Anthos.js'

export class AnthosNodes {
  constructor(private readonly anthos: Anthos) {}

  getAll(): Promise<{ nodes: LogicalNodeRecord[] }> {
    return this.anthos.request<{ nodes: LogicalNodeRecord[] }>('/api/nodes')
  }

  claim(nodeId: string, displayName: string, capability: 'earth' | 'watering' = 'earth'): Promise<LogicalNodeRecord> {
    return this.anthos.request<LogicalNodeRecord>(`/api/nodes/${nodeId}`, {
      method: 'PATCH',
      body: { displayName, capability },
    })
  }

  updateCapability(nodeId: string, capability: 'earth' | 'watering'): Promise<LogicalNodeRecord> {
    return this.anthos.request<LogicalNodeRecord>(`/api/nodes/${nodeId}/capability`, {
      method: 'PATCH',
      body: { capability },
    })
  }

  openProvisionWindow(): Promise<void> {
    return this.anthos.request<void>('/api/provision/open', {
      method: 'POST',
    })
  }

  getLatestTelemetry(): Promise<TelemetryPayload> {
    return this.anthos.request<TelemetryPayload>('/api/telemetry/latest')
  }

  queuePump(nodeId: string, durationMs: number): Promise<{ nodeId: string; commandId: string; status: 'pending' }> {
    return this.anthos.request<{ nodeId: string; commandId: string; status: 'pending' }>(
      `/api/nodes/${nodeId}/commands`,
      {
        method: 'POST',
        body: { durationMs } satisfies QueuePumpCommandRequest,
      }
    )
  }
}
