import type { LatestTelemetryResponse, LogicalNodeRecord } from '../../nodes/types/index.js'
import type { SoilMoistureCapability } from '../../nodes/types/moisture.js'
import type { QueuePumpCommandRequest } from '../../commands.js'
import type {
  ApplyPowerProfileRequest,
  NodePowerProfileState,
  PowerProfile,
} from '../../nodes/types/powerProfile.js'
import { POWER_PROFILES } from '../../nodes/utils/powerProfile.js'
import type { Anthos } from './Anthos.js'

export class AnthosNodes {
  constructor(private readonly anthos: Anthos) {}

  getAll(): Promise<{ nodes: LogicalNodeRecord[] }> {
    return this.anthos.request<{ nodes: LogicalNodeRecord[] }>('/api/nodes')
  }

  claim(nodeId: string, displayName: string, capability: SoilMoistureCapability = 'earth'): Promise<LogicalNodeRecord> {
    return this.anthos.request<LogicalNodeRecord>(`/api/nodes/${nodeId}`, {
      method: 'PATCH',
      body: { displayName, capability },
    })
  }

  updateCapability(nodeId: string, capability: SoilMoistureCapability): Promise<LogicalNodeRecord> {
    return this.anthos.request<LogicalNodeRecord>(`/api/nodes/${nodeId}/capability`, {
      method: 'PATCH',
      body: { capability },
    })
  }

  updateDisplayName(nodeId: string, displayName: string): Promise<LogicalNodeRecord> {
    return this.anthos.request<LogicalNodeRecord>(`/api/nodes/${nodeId}/name`, {
      method: 'PATCH',
      body: { displayName },
    })
  }

  updateOrder(nodeId: string, order: number | null): Promise<LogicalNodeRecord> {
    return this.anthos.request<LogicalNodeRecord>(`/api/nodes/${nodeId}/order`, {
      method: 'PATCH',
      body: { order },
    })
  }

  openProvisionWindow(): Promise<void> {
    return this.anthos.request<void>('/api/provision/open', {
      method: 'POST',
    })
  }

  getLatestTelemetryByNode(): Promise<LatestTelemetryResponse> {
    return this.anthos.request<LatestTelemetryResponse>('/api/telemetry/latest-by-node')
  }

  queuePump(nodeId: string, volumeMl: number): Promise<{ nodeId: string; commandId: string; status: 'pending' }> {
    return this.anthos.request<{ nodeId: string; commandId: string; status: 'pending' }>(
      `/api/nodes/${nodeId}/commands`,
      {
        method: 'POST',
        body: { volumeMl } satisfies QueuePumpCommandRequest,
      }
    )
  }

  getPowerProfile(nodeId: string): Promise<NodePowerProfileState> {
    return this.anthos.request<NodePowerProfileState>(`/api/nodes/${nodeId}/power-profile`)
  }

  applyPowerProfile(nodeId: string, profileId: PowerProfile): Promise<NodePowerProfileState> {
    const profile = POWER_PROFILES[profileId]
    if (!profile) {
      throw new Error(`Unknown power profile: ${profileId}`)
    }

    return this.anthos.request<NodePowerProfileState>(`/api/nodes/${nodeId}/power-profile`, {
      method: 'PATCH',
      body: {
        profileId: profile.profileId,
      } satisfies ApplyPowerProfileRequest,
    })
  }
}
