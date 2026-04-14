export type CommandType = 'pump'

export type CommandStatus = 'pending' | 'completed' | 'failed'

export interface PumpCommandPayload {
  volumeMl: number
  durationMs: number
}

export interface QueuedCommand {
  commandId: string
  nodeId: string
  type: CommandType
  status: CommandStatus
  payload: PumpCommandPayload
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

export interface CommandAckRequest {
  result: 'completed' | 'failed'
  message?: string
}
