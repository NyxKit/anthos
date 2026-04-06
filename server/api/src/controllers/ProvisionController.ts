import type { Request, Response, RequestHandler } from 'express'

import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { PairingWindowService } from '../services/PairingWindowService.js'

export class ProvisionController {
  constructor(
    private readonly registry: NodeRegistryService,
    private readonly pairing: PairingWindowService,
    private readonly saveDb: () => Promise<void>
  ) {}

  register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { hwId, firmwareVersion } = req.body as { hwId?: string; firmwareVersion?: string }

    if (!hwId) {
      res.status(400).json({ error: 'hwId is required' })
      return
    }

    const fwVersion = firmwareVersion ?? ''

    // Always upsert hardware node to track last_seen and firmware_version
    this.registry.upsertHardwareNode(hwId, fwVersion)

    const existing = this.registry.findLogicalNodeByHwId(hwId)

    if (existing) {
      // Known node reconnecting — bypass pairing window
      const storedFirmware = this.registry.getHardwareNodeFirmwareVersion(hwId)
      const firmwareUpdated = storedFirmware !== null && storedFirmware !== fwVersion

      const response: Record<string, unknown> = {
        nodeId: existing.nodeId,
        status: 'reconnected',
      }
      if (firmwareUpdated) {
        response['firmwareUpdated'] = true
      }

      res.json(response)
      return
    }

    // New node — check pairing window
    if (!this.pairing.isOpen()) {
      res.status(403).json({ error: 'Pairing window closed' })
      return
    }

    const nodeId = this.registry.createLogicalNode(hwId)
    await this.saveDb()

    res.json({ nodeId, status: 'registered' })
  }

  openProvisionWindow: RequestHandler = (_req: Request, res: Response): void => {
    this.pairing.open()
    res.json({ message: 'Pairing window opened', ...this.pairing.getStatus() })
  }

  getProvisionStatus: RequestHandler = (_req: Request, res: Response): void => {
    res.json(this.pairing.getStatus())
  }

  listNodes: RequestHandler = (_req: Request, res: Response): void => {
    const nodes = this.registry.listLogicalNodes()
    res.json({ nodes })
  }

  claimNode: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const nodeId = String(req.params['id'])
    const { displayName } = req.body as { displayName?: string }

    if (!displayName) {
      res.status(400).json({ error: 'displayName is required' })
      return
    }

    if (displayName.trim() === '') {
      res.status(400).json({ error: 'displayName must not be empty' })
      return
    }

    const claimed = this.registry.claimNode(nodeId, displayName)

    if (!claimed) {
      res.status(404).json({ error: 'Node not found or already claimed' })
      return
    }

    await this.saveDb()

    res.json({ nodeId, displayName, claimStatus: 'claimed' })
  }
}
