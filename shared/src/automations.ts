import type { SensorType } from './nodes/types/sensor.js'

export enum AutomationComparisonOperator {
  LessThan = '<',
  GreaterThan = '>',
  Equal = '==',
}

export enum AutomationCommandType {
  Water = 'water',
  Alert = 'alert',
}

export interface AutomationCommand {
  commandType: AutomationCommandType
  [key: string]: unknown
}

export interface AutomationRecord {
  automationId: string
  nodeId: string
  sensorType: SensorType
  operator: AutomationComparisonOperator
  thresholdValue: number
  commandType: AutomationCommandType
  command: AutomationCommand
  enabled: boolean
  lastTriggeredAt: number | null
  createdAt: number
  updatedAt: number
}

export interface AutomationListResponse {
  automations: AutomationRecord[]
}

export interface AutomationUpsertInput {
  nodeId: string
  sensorType: SensorType
  operator: AutomationComparisonOperator
  thresholdValue: number
  commandType: AutomationCommandType
  command: AutomationCommand
  enabled?: boolean
}

export interface AutomationTriggerContext {
  nodeId: string
  sensorType: SensorType
  currentValue: number
  previousValue: number | null
  timestamp: number
}
