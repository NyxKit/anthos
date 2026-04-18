export type { SensorName, NodeHealthPayload, SensorSample, TelemetryPayload, NodeTelemetryPayload, LatestTelemetryResponse } from '@anthos/shared/nodes/types'

export interface Node {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'unknown'
  lastSeen: number
}

export interface SensorReading {
  nodeId: string
  timestamp: number
  sensor: string
  metric: string
  value: number
  unit: string
}

export interface TelemetryResponse {
  node: Node
  readings: SensorReading[]
}

export interface TelemetryState {
  node: Node | null
  readings: SensorReading[]
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
}
