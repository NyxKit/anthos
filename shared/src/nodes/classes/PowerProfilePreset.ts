import { NyxLoader } from 'nyx-kit/classes'
import { PowerProfile, type PowerProfileConfig } from '../types/powerProfile.js'
import { DEFAULT_POWER_PROFILE } from '../data/powerProfiles.js'

export default class PowerProfilePreset {
  id: PowerProfile = DEFAULT_POWER_PROFILE
  label = ''
  icon = ''
  intervalMs = 0

  constructor (data?: unknown) {
    if (!data) throw new Error('Power profile data is required')

    this.id = NyxLoader.loadEnum<PowerProfile>(data, 'id', this.id, Object.values(PowerProfile))
    this.label = NyxLoader.loadString(data, 'label', this.label)
    this.icon = NyxLoader.loadString(data, 'icon', this.icon)
    this.intervalMs = NyxLoader.loadNumber(data, 'intervalMs', this.intervalMs)
  }

  get config(): PowerProfileConfig {
    return {
      intervalMs: this.intervalMs,
    }
  }
}
