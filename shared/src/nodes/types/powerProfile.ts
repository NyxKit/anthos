export enum PowerProfile {
  PowerSaver = 'power-saver',
  Balanced = 'balanced',
  Performance = 'performance',
}

export interface PowerProfileDefinition {
  profileId: PowerProfile
  label: string
  icon: string
  readIntervalMs: number
  telemetryIntervalMs: number
  queueIntervalMs: number
}

export interface PowerProfileAssignmentState {
  profileId: PowerProfile
  readIntervalMs: number
  telemetryIntervalMs: number
  queueIntervalMs: number
  updatedAt: number
}

export interface PowerProfileAppliedState {
  profileId: PowerProfile
  readIntervalMs: number
  telemetryIntervalMs: number
  queueIntervalMs: number
  appliedAt: number
}

export interface NodePowerProfileState {
  nodeId: string
  assignment: PowerProfileAssignmentState | null
  applied: PowerProfileAppliedState | null
}

export interface ApplyPowerProfileRequest {
  profileId: PowerProfile
}

export interface ReportPowerProfileAppliedRequest {
  profileId: PowerProfile
  appliedAt?: number
}
