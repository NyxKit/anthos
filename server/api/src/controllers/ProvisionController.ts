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
        capability: existing.capability,
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

    const created = this.registry.getLogicalNode(nodeId)
    res.json({ nodeId, status: 'registered', capability: created?.capability ?? 'earth' })
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
    const { displayName, capability } = req.body as { displayName?: string; capability?: string }

    if (!displayName) {
      res.status(400).json({ error: 'displayName is required' })
      return
    }

    if (displayName.trim() === '') {
      res.status(400).json({ error: 'displayName must not be empty' })
      return
    }

    const normalizedCapability = capability === 'watering' ? 'watering' : 'earth'
    const claimed = this.registry.claimNode(nodeId, displayName, normalizedCapability)

    if (!claimed) {
      res.status(404).json({ error: 'Node not found or already claimed' })
      return
    }

    await this.saveDb()

    res.json({ nodeId, displayName, claimStatus: 'claimed', capability: normalizedCapability })
  }

  updateCapability: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const nodeId = String(req.params['id'])
    const { capability } = req.body as { capability?: string }

    const normalizedCapability = capability === 'watering' ? 'watering' : 'earth'
    const updated = this.registry.updateCapability(nodeId, normalizedCapability)

    if (!updated) {
      res.status(404).json({ error: 'Node not found or not claimed' })
      return
    }

    await this.saveDb()

    res.json(this.registry.getLogicalNode(nodeId))
  }

  updateDisplayName: RequestHandler = async (req: Request, res: Response): Promise<void> => {
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

    const updated = this.registry.updateDisplayName(nodeId, displayName.trim())

    if (!updated) {
      res.status(404).json({ error: 'Node not found or not claimed' })
      return
    }

    await this.saveDb()

    res.json(this.registry.getLogicalNode(nodeId))
  }
}
