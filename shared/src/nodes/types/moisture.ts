export type SoilMoistureCapability = 'earth' | 'watering'

export interface SoilMoistureCalibrationConfig {
  dryRaw: number
  wetRaw: number
  curveExponent?: number
}
