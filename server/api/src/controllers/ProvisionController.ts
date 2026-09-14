import type { Request, Response, RequestHandler } from 'express'

import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { PairingWindowService } from '../services/PairingWindowService.js'
import { AuthController } from './AuthController.js'
import { AuthService } from '../services/AuthService.js'

export class ProvisionController {
  constructor(
    private readonly registry: NodeRegistryService,
    private readonly pairing: PairingWindowService,
    private readonly auth: AuthService
  ) {}

  register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { hwId, firmwareVersion } = req.body as { hwId?: string; firmwareVersion?: string }

    if (!hwId) {
      res.status(400).json({ error: 'hwId is required' })
      return
    }

    const fwVersion = firmwareVersion ?? ''

    // Always upsert hardware node to track last_seen and firmware_version
    await this.registry.upsertHardwareNode(hwId, fwVersion)
    const deviceToken = await this.registry.ensureHardwareNodeWriteToken(hwId)

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
      response['deviceToken'] = deviceToken

      res.json(response)
      return
    }

    // New node — check pairing window
    if (!this.pairing.isOpen()) {
      res.status(403).json({ error: 'Pairing window closed' })
      return
    }

    const nodeId = await this.registry.createLogicalNode(hwId)

    const created = this.registry.getLogicalNode(nodeId)
    res.json({ nodeId, status: 'registered', capability: created?.capability ?? 'earth', deviceToken })
  }

  openProvisionWindow: RequestHandler = (_req: Request, res: Response): void => {
    const token = AuthController.readToken(_req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    void this.auth.requireActionUser(token)
      .then(() => {
        this.pairing.open()
        res.json({ message: 'Pairing window opened', ...this.pairing.getStatus() })
      })
      .catch(error => {
        const message = error instanceof Error ? error.message : 'not_authorized'
        res.status(message === 'not_authorized' ? 403 : 500).json({ error: message })
      })
  }

  getProvisionStatus: RequestHandler = (_req: Request, res: Response): void => {
    res.json(this.pairing.getStatus())
  }

  listNodes: RequestHandler = (_req: Request, res: Response): void => {
    const nodes = this.registry.listLogicalNodes()
    res.json({ nodes })
  }

  updateCapability: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const token = AuthController.readToken(req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    try {
      await this.auth.requireActionUser(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'not_authorized'
      res.status(message === 'not_authorized' ? 403 : 500).json({ error: message })
      return
    }

    const nodeId = String(req.params['id'])
    const { capability } = req.body as { capability?: string }

    const normalizedCapability = capability === 'watering' ? 'watering' : 'earth'
    const updated = await this.registry.updateCapability(nodeId, normalizedCapability)

    if (!updated) {
      res.status(404).json({ error: 'Node not found' })
      return
    }

    res.json(this.registry.getLogicalNode(nodeId))
  }

  updateDisplayName: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const token = AuthController.readToken(req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    try {
      await this.auth.requireActionUser(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'not_authorized'
      res.status(message === 'not_authorized' ? 403 : 500).json({ error: message })
      return
    }

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

    const updated = await this.registry.updateDisplayName(nodeId, displayName.trim())

    if (!updated) {
      res.status(404).json({ error: 'Node not found' })
      return
    }

    res.json(this.registry.getLogicalNode(nodeId))
  }

  updateOrder: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const token = AuthController.readToken(req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    try {
      await this.auth.requireActionUser(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'not_authorized'
      res.status(message === 'not_authorized' ? 403 : 500).json({ error: message })
      return
    }

    const nodeId = String(req.params['id'])
    const { order } = req.body as { order?: number | null }

    if (order !== null && order !== undefined && !Number.isFinite(Number(order))) {
      res.status(400).json({ error: 'order must be a number or null' })
      return
    }

    const normalizedOrder = order === undefined ? null : (order === null ? null : Number(order))
    const updated = await this.registry.updateOrder(nodeId, normalizedOrder)

    if (!updated) {
      res.status(404).json({ error: 'Node not found' })
      return
    }

    res.json(this.registry.getLogicalNode(nodeId))
  }

  delete: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const token = AuthController.readToken(req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    try {
      await this.auth.requireActionUser(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'not_authorized'
      res.status(message === 'not_authorized' ? 403 : 500).json({ error: message })
      return
    }

    const nodeId = String(req.params['id'])
    const deleted = await this.registry.deleteLogicalNode(nodeId)

    if (!deleted) {
      res.status(404).json({ error: 'Node not found' })
      return
    }

    res.status(204).send()
  }
}
