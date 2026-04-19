export enum SensorType {
  DLight = 'dlight',
  ENV = 'env',
  Moisture = 'moisture',
}

export interface SensorSample {
  type: SensorType
  value: number
  unit?: string
}
