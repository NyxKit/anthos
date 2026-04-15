export enum PowerProfile {
  PowerSaver = 'power-saver',
  Balanced = 'balanced',
  Performance = 'performance',
  Debug = 'debug',
}

export interface PowerProfileDefinition {
  profileId: PowerProfile
  label: string
  telemetryIntervalMs: number
  queueIntervalMs: number
}

export interface PowerProfileAssignmentState {
  profileId: PowerProfile
  telemetryIntervalMs: number
  queueIntervalMs: number
  updatedAt: number
}

export interface PowerProfileAppliedState {
  profileId: PowerProfile
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
  telemetry_interval_ms: number
  queue_interval_ms: number
}

export interface ReportPowerProfileAppliedRequest {
  profileId: PowerProfile
  telemetry_interval_ms: number
  queue_interval_ms: number
  appliedAt?: number
}

export const POWER_PROFILES: Record<PowerProfile, PowerProfileDefinition> = {
  [PowerProfile.PowerSaver]: {
    profileId: PowerProfile.PowerSaver,
    label: 'Power Saver',
    telemetryIntervalMs: 3600000,
    queueIntervalMs: 3600000,
  },
  [PowerProfile.Balanced]: {
    profileId: PowerProfile.Balanced,
    label: 'Balanced',
    telemetryIntervalMs: 600000,
    queueIntervalMs: 600000,
  },
  [PowerProfile.Performance]: {
    profileId: PowerProfile.Performance,
    label: 'Performance',
    telemetryIntervalMs: 60000,
    queueIntervalMs: 60000,
  },
  [PowerProfile.Debug]: {
    profileId: PowerProfile.Debug,
    label: 'Debug',
    telemetryIntervalMs: 1000,
    queueIntervalMs: 1000,
  },
}

export function getPowerProfileLabel(profileId: PowerProfile): string {
  return POWER_PROFILES[profileId]?.label ?? profileId
}
