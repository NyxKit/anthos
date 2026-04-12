import type { DashboardMetrics } from '../../dashboard.js'
import type { Anthos } from './Anthos.js'

export class AnthosMetrics {
  constructor(private readonly anthos: Anthos) {}

  getDashboard(): Promise<DashboardMetrics> {
    return this.anthos.request<DashboardMetrics>('/api/metrics')
  }
}
