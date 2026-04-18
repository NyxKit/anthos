import type { Request, Response, RequestHandler } from 'express'

import type {
  ApplyPowerProfileRequest,
} from '@anthos/shared/nodes/types/powerProfile'
import { PowerProfile } from '@anthos/shared/nodes/types/powerProfile'
import { POWER_PROFILES } from '@anthos/shared/nodes/data/powerProfiles'

import { LogArchiveService } from '../services/LogArchiveService.js'
import { CommandQueueService } from '../services/CommandQueueService.js'
import { NodeRegistryService } from '../services/NodeRegistryService.js'

export class PowerProfileController {
  constructor(
    private readonly registry: NodeRegistryService,
    private readonly logArchive: LogArchiveService,
    private readonly commands: CommandQueueService,
    private readonly saveDb: () => Promise<void>
  ) {}

  getNodeProfile: RequestHandler = (req: Request, res: Response): void => {
    const nodeId = String(req.params['id'])
    const state = this.registry.getPowerProfileState(nodeId)

    if (!state) {
      res.status(404).json({ error: 'Node not found' })
      return
    }

    res.json(state)
  }

  applyProfile: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const nodeId = String(req.params['id'])
    const body = req.body as Partial<ApplyPowerProfileRequest>
    const profileId = body.profileId as PowerProfile | undefined

    await this.logArchive.recordEntry({
      nodeId,
      level: 'info',
      source: 'power-profile',
      message: `Power profile request for ${nodeId}`,
      meta: { profileId },
    })

    if (!profileId) {
      await this.logArchive.recordEntry({
        nodeId,
        level: 'warn',
        source: 'power-profile',
        message: `Power profile rejected for ${nodeId}`,
        meta: { reason: 'missing_profile_id' },
      })
      res.status(400).json({ error: 'profileId is required' })
      return
    }

    const profile = POWER_PROFILES[profileId]
    if (!profile) {
      await this.logArchive.recordEntry({
        nodeId,
        level: 'warn',
        source: 'power-profile',
        message: `Power profile rejected for ${nodeId}`,
        meta: { reason: 'unknown_profile', profileId },
      })
      res.status(404).json({ error: 'Power profile not found' })
      return
    }

    const updated = this.registry.setPowerProfileAssignment(nodeId, profile)
    if (!updated) {
      await this.logArchive.recordEntry({
        nodeId,
        level: 'warn',
        source: 'power-profile',
        message: `Power profile rejected for ${nodeId}`,
        meta: { reason: 'node_not_found', profileId },
      })
      res.status(404).json({ error: 'Node not found' })
      return
    }

    await this.commands.enqueuePowerProfileCommand(nodeId, {
      readIntervalMs: profile.readIntervalMs,
      telemetryIntervalMs: profile.telemetryIntervalMs,
      queueIntervalMs: profile.queueIntervalMs,
    })

    await this.saveDb()

    const state = this.registry.getPowerProfileState(nodeId)
    res.json(state)
  }
}
