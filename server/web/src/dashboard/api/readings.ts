import { ofetch } from 'ofetch'
import type { TelemetryPayload } from '@/shared/types/telemetry'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8088'

export async function fetchReadings(): Promise<TelemetryPayload> {
  return ofetch<TelemetryPayload>('/api/telemetry/latest', {
    baseURL: API_BASE,
  })
}
