import type { LogicalNodeRecord, TelemetryPayload } from '../../telemetry.ts'
import type { Anthos } from './Anthos.ts'

export class AnthosNodes {
  constructor(private readonly anthos: Anthos) {}

  getAll(): Promise<{ nodes: LogicalNodeRecord[] }> {
    return this.anthos.request<{ nodes: LogicalNodeRecord[] }>('/api/nodes')
  }

  claim(nodeId: string, displayName: string): Promise<LogicalNodeRecord> {
    return this.anthos.request<LogicalNodeRecord>(`/api/nodes/${nodeId}`, {
      method: 'PATCH',
      body: { displayName },
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
}
