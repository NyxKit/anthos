import { PowerProfile } from './nodes/types/powerProfile.js'
import { POWER_PROFILES } from './nodes/data/powerProfiles.js'

export { PowerProfile }
export type {
  ApplyPowerProfileRequest,
  NodePowerProfileState,
  PowerProfileAppliedState,
  PowerProfileAssignmentState,
  PowerProfileDefinition,
  ReportPowerProfileAppliedRequest,
} from './nodes/types/powerProfile.js'
export { POWER_PROFILES }

export function getPowerProfileLabel(profileId: PowerProfile): string {
  const profile = POWER_PROFILES[profileId]
  if (!profile) throw new Error(`Unknown power profile: ${profileId}`)
  return profile.label
}
