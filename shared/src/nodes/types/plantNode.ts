import type { SensorSample } from './sensor.js'
import type { SoilMoistureCapability } from './moisture.js'
import { PowerProfile } from './powerProfile.js'

export enum NodeCapability {
  Earth = 'earth',
  Watering = 'watering',
}

export enum NodeRegistrationStatus {
  Registered = 'registered',
  Reconnected = 'reconnected',
}

export enum NodeStatus {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Idle = 'idle',
  Error = 'error',
}

export type SensorName = 'dlight' | 'env' | 'earth'

export interface NodeRegistrationResponse {
  nodeId: string
  status: NodeRegistrationStatus
  capability: SoilMoistureCapability
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
  capability: SoilMoistureCapability
  order: number | null
  registeredAt: number
  powerProfile: PowerProfile
  powerProfileAssignedAt: number
}

export interface HardwareNodeRegistration {
  hwId: string
  firmwareVersion: string
}
