import type { Request, Response, RequestHandler } from 'express'

import type { AutomationUpsertInput } from '@anthos/shared/automations'

import { AutomationService } from '../services/AutomationService.js'

export class AutomationController {
  constructor(private readonly automations: AutomationService) {}

  list: RequestHandler = (_req: Request, res: Response): void => {
    res.json({ automations: this.automations.list() })
  }

  create: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const automation = await this.automations.create(req.body as AutomationUpsertInput)
      res.status(201).json({ automation })
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create automation' })
    }
  }

  update: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const automation = await this.automations.update(String(req.params['automationId']), req.body as AutomationUpsertInput)
      res.json({ automation })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update automation'
      res.status(message === 'Automation not found' ? 404 : 400).json({ error: message })
    }
  }

  delete: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.automations.delete(String(req.params['automationId']))
      res.status(204).send()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete automation'
      res.status(message === 'Automation not found' ? 404 : 400).json({ error: message })
    }
  }
}
