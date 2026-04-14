import type { Request, Response } from 'express'

import type { TelemetryPayload } from '@anthos/shared'
import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { TelemetryService } from '../services/TelemetryService.js'
import { LogArchiveService } from '../services/LogArchiveService.js'

export class IngestController {
  constructor(
    private readonly telemetryService: TelemetryService,
    private readonly logArchive: LogArchiveService,
    private readonly registry: NodeRegistryService,
    private readonly saveDb: () => Promise<void>
  ) {}

  getLatestTelemetry = (_req: Request, res: Response): void => {
    const payload = this.telemetryService.getLatest()
    if (!payload) {
      res.status(404).json({ error: 'No telemetry received yet' })
      return
    }

    const nodeRecord = this.registry.getLogicalNode(payload.nodeId)
    res.json({
      ...payload,
      capability: nodeRecord?.capability ?? 'earth',
    })
  }

  postTelemetry = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as TelemetryPayload

    if (!payload?.nodeId || !payload?.hwId || !Array.isArray(payload?.sensors) || !payload?.health) {
      res.status(400).json({ error: 'Invalid telemetry payload' })
      return
    }

    this.registry.upsertHardwareNode(payload.hwId)

    let nodeId = payload.nodeId
    const existing = this.registry.findLogicalNodeByHwId(payload.hwId)
    if (existing) {
      nodeId = existing.nodeId
    } else {
      nodeId = this.registry.createLogicalNode(payload.hwId)
      await this.saveDb()
    }

    payload.nodeId = nodeId

    await this.telemetryService.ingest(payload)

    await this.logArchive.recordTelemetry(payload).catch(error => {
      console.error('log.archive.record.failed', error)
    })

    const nodeRecord = this.registry.getLogicalNode(nodeId)
    res.status(202).json({
      status: existing ? 'accepted' : 'registered',
      nodeId,
      capability: nodeRecord?.capability ?? 'earth',
    })
  }
}
