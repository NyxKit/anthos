export enum CommandType {
  Pump = 'pump',
  PowerProfile = 'power-profile',
}

export type CommandStatus = 'pending' | 'completed' | 'failed'

export interface PumpCommandPayload {
  volumeMl: number
  durationMs: number
}

export interface PowerProfileCommandPayload {
  profileId: string
  telemetryIntervalMs: number
  queueIntervalMs: number
}

export type CommandPayload = PumpCommandPayload | PowerProfileCommandPayload

export interface QueuedCommand {
  commandId: string
  nodeId: string
  type: CommandType
  status: CommandStatus
  payload: CommandPayload
  createdAt: number
  updatedAt: number
}

export interface CommandQueueResponse {
  nodeId: string
  capability: 'earth' | 'watering'
  commands: QueuedCommand[]
}

export interface QueuePumpCommandRequest {
  volumeMl: number
}

export interface QueuePowerProfileCommandRequest {
  profileId: string
  telemetryIntervalMs: number
  queueIntervalMs: number
}

export interface CommandAckRequest {
  result: 'completed' | 'failed'
  message?: string
}
