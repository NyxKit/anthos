import type { RequestHandler } from 'express'

import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { TelemetryService } from '../services/TelemetryService.js'

export class MetricsController {
  constructor(
    private readonly telemetry: TelemetryService,
    private readonly registry: NodeRegistryService
  ) {}

  getDashboardMetrics: RequestHandler = (_req, res): void => {
    res.json({
      activeNodes: this.registry.countActiveNodes(),
      totalNodes: this.registry.countLogicalNodes(),
      avgHumidity: this.telemetry.getAverageHumidity(),
      uptimeMs: Math.round(process.uptime() * 1000),
      networkLatencyMs: this.telemetry.getLatest()?.health.latencyMs ?? null,
    })
  }
}
