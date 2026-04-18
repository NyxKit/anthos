import { NodeCapability, type SoilMoistureCalibrationConfig } from '../types/index.js'

export const SOIL_MOISTURE_CALIBRATIONS: Record<NodeCapability, SoilMoistureCalibrationConfig> = {
  [NodeCapability.Earth]: {
    dryRaw: 4095,
    wetRaw: 1500,
    curveExponent: 1,
  },
  [NodeCapability.Watering]: {
    dryRaw: 2100,
    wetRaw: 1500,
    curveExponent: 0.33,
  },
}
