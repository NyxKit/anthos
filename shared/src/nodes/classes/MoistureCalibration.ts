import { SOIL_MOISTURE_CALIBRATIONS } from '../data/moisture.js'
import type { SoilMoistureCalibrationConfig, SoilMoistureCapability } from '../types/moisture.js'

export default class MoistureCalibration {
  capability: SoilMoistureCapability

  constructor(capability: SoilMoistureCapability) {
    this.capability = capability
  }

  get config (): SoilMoistureCalibrationConfig {
    const config = SOIL_MOISTURE_CALIBRATIONS[this.capability]
    if (!config) throw new Error(`Unknown soil moisture calibration for capability: ${this.capability}`)
    return config
  }

  public normalizeRaw (raw: number): number {
    if (!Number.isFinite(raw)) return 0
    const dryRaw = Math.max(this.config.dryRaw, this.config.wetRaw)
    const wetRaw = Math.min(this.config.dryRaw, this.config.wetRaw)
    if (dryRaw === wetRaw) return 0
    const mapped = ((dryRaw - raw) / (dryRaw - wetRaw)) * 100
    return this.applyCurve(this.clampPercent(mapped), this.config.curveExponent)
  }

  public normalizeReadings (readings: number[]): number {
    return this.normalizeRaw(this.getMedian(readings))
  }

  private clampPercent (value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)))
  }
  
  private applyCurve (percent: number, exponent = 1): number {
    if (!Number.isFinite(exponent) || exponent <= 0) return percent
    if (percent === 0 || percent === 100 || exponent === 1) return percent
    return this.clampPercent(Math.pow(percent / 100, exponent) * 100)
  }

  private getMedian (values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((left, right) => left - right)
    const middle = Math.floor(sorted.length / 2)
    if (sorted.length % 2 === 1) return sorted[middle]
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  
}
