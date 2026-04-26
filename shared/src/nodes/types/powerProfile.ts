export enum PowerProfile {
  PowerSaver = 'power-saver',
  Balanced = 'balanced',
  Performance = 'performance',
}
export interface PowerProfileConfig {
  intervalMs: number
}

export interface PowerProfileDefinition {
  id: PowerProfile
  label: string
  icon: string
  intervalMs: number
}

export interface PowerProfileAssignmentState {
  profileId: PowerProfile
  intervalMs: number
  updatedAt: number
}

export interface PowerProfileAppliedState {
  profileId: PowerProfile
  intervalMs: number
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
