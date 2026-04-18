import { NyxLoader } from 'nyx-kit/classes'
import { PowerPreset, type PowerProfileConfig } from '../types/powerProfile.js'

export default class PowerProfile {
  profileId: PowerPreset = PowerPreset.Balanced
  label = ''
  icon = ''
  readIntervalMs = 0
  telemetryIntervalMs = 0
  queueIntervalMs = 0

  constructor (data?: unknown) {
    if (!data) throw new Error('Power profile data is required')

    this.profileId = NyxLoader.loadEnum<PowerPreset>(data, 'profileId', this.profileId, Object.values(PowerPreset))
    this.label = NyxLoader.loadString(data, 'label', this.label)
    this.icon = NyxLoader.loadString(data, 'icon', this.icon)
    this.readIntervalMs = NyxLoader.loadNumber(data, 'readIntervalMs', this.readIntervalMs)
    this.telemetryIntervalMs = NyxLoader.loadNumber(data, 'telemetryIntervalMs', this.telemetryIntervalMs)
    this.queueIntervalMs = NyxLoader.loadNumber(data, 'queueIntervalMs', this.queueIntervalMs)
  }

  get config(): PowerProfileConfig {
    return {
      readIntervalMs: this.readIntervalMs,
      telemetryIntervalMs: this.telemetryIntervalMs,
      queueIntervalMs: this.queueIntervalMs,
    }
  }
}
