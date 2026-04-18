export enum SensorType {
  DLight = 'dlight',
  ENV = 'env',
  Earth = 'earth',
  Watering = 'watering',
}

export interface SensorSample {
  type: SensorType
  value: number
  unit?: string
}
