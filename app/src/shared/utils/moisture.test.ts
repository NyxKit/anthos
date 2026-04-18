import { describe, expect, it } from 'vitest'
import {
  getSoilMoistureCalibration,
  median,
  normalizeSoilMoistureRaw,
  normalizeSoilMoistureReadings,
  normalizeSoilMoistureByCapability,
  normalizeSoilMoistureReadingsByCapability,
} from '@anthos/shared/nodes/utils/moisture'

describe('soil moisture calibration', () => {
  it('maps the earth profile to a 0-100 scale', () => {
    const calibration = getSoilMoistureCalibration('earth')

    expect(normalizeSoilMoistureRaw(4095, calibration)).toBe(0)
    expect(normalizeSoilMoistureRaw(1500, calibration)).toBe(100)
    expect(normalizeSoilMoistureByCapability(1500, 'earth')).toBe(100)
  })

  it('maps the watering profile to a 0-100 scale', () => {
    const calibration = getSoilMoistureCalibration('watering')

    expect(normalizeSoilMoistureRaw(2100, calibration)).toBe(0)
    expect(normalizeSoilMoistureRaw(1500, calibration)).toBe(100)
    expect(normalizeSoilMoistureRaw(1850, calibration)).toBe(75)
    expect(normalizeSoilMoistureReadingsByCapability([2100, 1850, 1500], 'watering')).toBe(75)
  })

  it('uses the median before mapping noisy readings', () => {
    const calibration = getSoilMoistureCalibration('earth')

    expect(median([2400, 2700, 2500])).toBe(2500)
    expect(normalizeSoilMoistureReadings([2400, 2700, 2500], calibration)).toBe(
      normalizeSoilMoistureRaw(2500, calibration)
    )
  })
})
