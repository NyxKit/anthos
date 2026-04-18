import type { SoilMoistureCalibrationConfig, SoilMoistureCapability } from '../types/moisture.js'

export const SOIL_MOISTURE_CALIBRATIONS: Record<SoilMoistureCapability, SoilMoistureCalibrationConfig> = {
  earth: {
    dryRaw: 4095,
    wetRaw: 1500,
    curveExponent: 1,
  },
  watering: {
    dryRaw: 2100,
    wetRaw: 1500,
    curveExponent: 0.33,
  },
}

export function getSoilMoistureCalibration(capability: SoilMoistureCapability): SoilMoistureCalibrationConfig {
  return SOIL_MOISTURE_CALIBRATIONS[capability]
}

export function normalizeSoilMoistureByCapability(raw: number, capability: SoilMoistureCapability): number {
  return normalizeSoilMoistureRaw(raw, getSoilMoistureCalibration(capability))
}

export function normalizeSoilMoistureReadingsByCapability(readings: number[], capability: SoilMoistureCapability): number {
  return normalizeSoilMoistureReadings(readings, getSoilMoistureCalibration(capability))
}

export function normalizeSoilMoistureRaw(raw: number, calibration: SoilMoistureCalibrationConfig): number {
  if (!Number.isFinite(raw)) return 0

  const dryRaw = Math.max(calibration.dryRaw, calibration.wetRaw)
  const wetRaw = Math.min(calibration.dryRaw, calibration.wetRaw)

  if (dryRaw === wetRaw) return 0

  const mapped = ((dryRaw - raw) / (dryRaw - wetRaw)) * 100
  return applyCurve(clampPercent(mapped), calibration.curveExponent)
}

export function normalizeSoilMoistureReadings(readings: number[], calibration: SoilMoistureCalibrationConfig): number {
  if (readings.length === 0) return 0
  return normalizeSoilMoistureRaw(median(readings), calibration)
}

export function median(values: number[]): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 1) return sorted[middle]
  return (sorted[middle - 1] + sorted[middle]) / 2
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function applyCurve(percent: number, exponent = 1): number {
  if (!Number.isFinite(exponent) || exponent <= 0) return percent
  if (percent === 0 || percent === 100 || exponent === 1) return percent
  return clampPercent(Math.pow(percent / 100, exponent) * 100)
}
