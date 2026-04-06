export type SensorName = 'dlight' | 'env' | 'earth'

export interface NodeHealthPayload {
  wifi: string
  ip: string
  rssi: number
  server: string
  target: string
  uptimeMs: number
}

export interface SensorSample {
  type: string
  value: number
  unit?: string
}

export interface TelemetryPayload {
  nodeId: string
  timestampMs: number
  health: NodeHealthPayload
  sensors: SensorSample[]
}
