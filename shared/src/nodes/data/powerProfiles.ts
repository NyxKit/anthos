import PowerProfilePreset from '../classes/PowerProfilePreset.js'
import { PowerProfile } from '../types/powerProfile.js'

export const DEFAULT_POWER_PROFILE = PowerProfile.Performance

export const POWER_PROFILES: Record<PowerProfile, PowerProfilePreset> = Object.freeze({
  [PowerProfile.PowerSaver]: new PowerProfilePreset({
    id: PowerProfile.PowerSaver,
    label: 'Power Saver',
    icon: 'leaf',
    intervalMs: 3600000,
  }),
  [PowerProfile.Balanced]: new PowerProfilePreset({
    id: PowerProfile.Balanced,
    label: 'Balanced',
    icon: 'scale',
    intervalMs: 600000,
  }),
  [PowerProfile.Performance]: new PowerProfilePreset({
    id: PowerProfile.Performance,
    label: 'Performance',
    icon: 'circle-gauge',
    intervalMs: 1000,
  }),
})
