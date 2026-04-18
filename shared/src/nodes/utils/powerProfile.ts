import {
  PowerProfile,
  type PowerProfileDefinition,
} from '../types/powerProfile.js'

export const POWER_PROFILES: Record<PowerProfile, PowerProfileDefinition> = {
  [PowerProfile.PowerSaver]: {
    profileId: PowerProfile.PowerSaver,
    label: 'Power Saver',
    icon: 'leaf',
    readIntervalMs: 3600000,
    telemetryIntervalMs: 3600000,
    queueIntervalMs: 3600000,
  },
  [PowerProfile.Balanced]: {
    profileId: PowerProfile.Balanced,
    label: 'Balanced',
    icon: 'scale',
    readIntervalMs: 600000,
    telemetryIntervalMs: 600000,
    queueIntervalMs: 600000,
  },
  [PowerProfile.Performance]: {
    profileId: PowerProfile.Performance,
    label: 'Performance',
    icon: 'circle-gauge',
    readIntervalMs: 1000,
    telemetryIntervalMs: 1000,
    queueIntervalMs: 1000,
  },
}

export function getPowerProfileLabel(profileId: PowerProfile): string {
  return POWER_PROFILES[profileId]?.label ?? profileId
}
