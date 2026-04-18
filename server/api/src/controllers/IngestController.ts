import type { Request, Response } from 'express'

import type { NodeTelemetryPayload, TelemetryPayload } from '@anthos/shared/nodes/types'
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

  getLatestTelemetryByNode = (_req: Request, res: Response): void => {
    const payloads = this.telemetryService.getLatestByNode()

    if (payloads.length === 0) {
      res.status(404).json({ error: 'No telemetry received yet' })
      return
    }

    res.json({ nodes: payloads })
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

    const nodeRecord = this.registry.getLogicalNode(nodeId)
    const telemetryPayload: NodeTelemetryPayload = {
      ...payload,
      nodeId,
      capability: nodeRecord?.capability ?? 'earth',
    }

    await this.telemetryService.ingest(telemetryPayload)

    await this.logArchive.recordTelemetry(telemetryPayload).catch(error => {
      console.error('log.archive.record.failed', error)
    })

    res.status(202).json({
      status: existing ? 'accepted' : 'registered',
      nodeId,
      capability: nodeRecord?.capability ?? 'earth',
    })
  }
}
