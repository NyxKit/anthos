import type { Request, Response, RequestHandler } from 'express'

import { NodeRegistryService } from '../services/NodeRegistryService.js'
import { CommandQueueService } from '../services/CommandQueueService.js'

export class CommandController {
  constructor(
    private readonly commands: CommandQueueService,
    private readonly registry: NodeRegistryService
  ) {}

  enqueuePump: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const nodeId = String(req.params['nodeId'])
    const { durationMs } = req.body as { durationMs?: number }

    if (!nodeId) {
      res.status(400).json({ error: 'nodeId is required' })
      return
    }

    if (!Number.isFinite(durationMs) || Number(durationMs) <= 0) {
      res.status(400).json({ error: 'durationMs must be a positive number' })
      return
    }

    const node = this.registry.getLogicalNode(nodeId)
    if (!node) {
      res.status(404).json({ error: 'Node not found' })
      return
    }

    if (node.capability !== 'watering') {
      res.status(403).json({ error: 'Node does not support pump commands' })
      return
    }

    const command = await this.commands.enqueuePumpCommand(nodeId, { durationMs: Number(durationMs) })
    res.status(201).json({ nodeId, commandId: command.commandId, status: command.status })
  }

  listPending: RequestHandler = (req: Request, res: Response): void => {
    const nodeId = String(req.params['nodeId'])

    if (!nodeId) {
      res.status(400).json({ error: 'nodeId is required' })
      return
    }

    const node = this.registry.getLogicalNode(nodeId)
    if (!node) {
      res.status(404).json({ error: 'Node not found' })
      return
    }

    res.json(this.commands.getPendingCommands(nodeId, node.capability))
  }

  acknowledge: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const nodeId = String(req.params['nodeId'])
    const commandId = String(req.params['commandId'])
    const { result, message } = req.body as { result?: string; message?: string }

    if (!nodeId || !commandId) {
      res.status(400).json({ error: 'nodeId and commandId are required' })
      return
    }

    if (result !== 'completed' && result !== 'failed') {
      res.status(400).json({ error: 'result must be completed or failed' })
      return
    }

    const command = await this.commands.acknowledgeCommand(nodeId, commandId, {
      result,
      message,
    })

    if (!command) {
      res.status(404).json({ error: 'Command not found' })
      return
    }

    res.json({ nodeId, commandId, status: command.status })
  }
}
