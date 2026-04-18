export type SoilMoistureCapability = 'earth' | 'watering'

export interface SoilMoistureCalibration {
  dryRaw: number
  wetRaw: number
  curveExponent?: number
}
