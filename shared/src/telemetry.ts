export type SensorName = 'dlight' | 'env' | 'earth'

export interface NodeHealthPayload {
  wifi: string
  ip: string
  rssi: number
  server: string
  target: string
  uptimeMs: number
  latencyMs?: number
}

export interface SensorSample {
  type: string
  value: number
  unit?: string
}

export interface TelemetryPayload {
  nodeId: string
  hwId: string
  timestampMs: number
  health: NodeHealthPayload
  sensors: SensorSample[]
}

export interface HardwareNodeRegistration {
  hwId: string
  firmwareVersion: string
}

export interface NodeRegistrationResponse {
  nodeId: string
  status: 'registered' | 'reconnected'
  capability: 'earth' | 'watering'
  firmwareUpdated?: boolean
}

export interface LogicalNodeRecord {
  nodeId: string
  hwId: string
  displayName: string | null
  claimStatus: 'unclaimed' | 'claimed'
  capability: 'earth' | 'watering'
  registeredAt: number
}
