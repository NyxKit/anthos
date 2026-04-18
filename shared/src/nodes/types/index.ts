import type { SoilMoistureCapability } from './moisture.js'

export type { SoilMoistureCapability, SoilMoistureCalibration } from './moisture.js'
export { PowerProfile } from './powerProfile.js'
export type {
  ApplyPowerProfileRequest,
  NodePowerProfileState,
  PowerProfileAppliedState,
  PowerProfileAssignmentState,
  PowerProfileDefinition,
  ReportPowerProfileAppliedRequest,
} from './powerProfile.js'

export enum NodeCapability {
  Earth = 'earth',
  Watering = 'watering',
}

export enum NodeClaimStatus {
  Unclaimed = 'unclaimed',
  Claimed = 'claimed',
}

export enum SensorType {
  DLight = 'dlight',
  ENV = 'env',
  Earth = 'earth',
  Watering = 'watering',
}

export type SensorName = 'dlight' | 'env' | 'earth'

export interface NodeRegistrationResponse {
  nodeId: string
  status: 'registered' | 'reconnected'
  capability: NodeCapability
  firmwareUpdated?: boolean
}

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
  type: SensorType
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

export interface NodeTelemetryPayload extends TelemetryPayload {
  capability: SoilMoistureCapability
}

export interface LatestTelemetryResponse {
  nodes: NodeTelemetryPayload[]
}

export interface LogicalNodeRecord {
  nodeId: string
  hwId: string
  displayName: string | null
  claimStatus: 'unclaimed' | 'claimed'
  capability: SoilMoistureCapability
  registeredAt: number
}
  
export interface HardwareNodeRegistration {
  hwId: string
  firmwareVersion: string
}
