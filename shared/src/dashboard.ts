export interface DashboardMetrics {
  activeNodes: number
  totalNodes: number
  avgHumidity: number | null
  uptimeMs: number | null
  networkLatencyMs: number | null
}
