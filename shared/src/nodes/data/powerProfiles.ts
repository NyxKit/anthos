import PowerProfile from '../classes/PowerProfile.js'
import { PowerPreset } from '../types/powerProfile.js'

export const POWER_PROFILES: Record<PowerPreset, PowerProfile> = Object.freeze({
  [PowerPreset.PowerSaver]: new PowerProfile({
    profileId: PowerPreset.PowerSaver,
    label: 'Power Saver',
    icon: 'leaf',
    readIntervalMs: 3600000,
    telemetryIntervalMs: 3600000,
    queueIntervalMs: 3600000,
  }),
  [PowerPreset.Balanced]: new PowerProfile({
    profileId: PowerPreset.Balanced,
    label: 'Balanced',
    icon: 'scale',
    readIntervalMs: 600000,
    telemetryIntervalMs: 600000,
    queueIntervalMs: 600000,
  }),
  [PowerPreset.Performance]: new PowerProfile({
    profileId: PowerPreset.Performance,
    label: 'Performance',
    icon: 'circle-gauge',
    readIntervalMs: 1000,
    telemetryIntervalMs: 1000,
    queueIntervalMs: 1000,
  }),
})
