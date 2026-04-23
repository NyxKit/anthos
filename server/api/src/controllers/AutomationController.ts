import type { Request, Response, RequestHandler } from 'express'

import type { AutomationUpsertInput } from '@anthos/shared/automations'

import { AutomationService } from '../services/AutomationService.js'
import { AuthController } from './AuthController.js'
import { AuthService } from '../services/AuthService.js'

export class AutomationController {
  constructor(
    private readonly automations: AutomationService,
    private readonly auth: AuthService
  ) {}

  list: RequestHandler = (_req: Request, res: Response): void => {
    res.json({ automations: this.automations.list() })
  }

  create: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    if (await this.requireActionAccess(req, res)) return

    try {
      const automation = await this.automations.create(req.body as AutomationUpsertInput)
      res.status(201).json({ automation })
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create automation' })
    }
  }

  update: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    if (await this.requireActionAccess(req, res)) return

    try {
      const automation = await this.automations.update(String(req.params['automationId']), req.body as AutomationUpsertInput)
      res.json({ automation })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update automation'
      res.status(message === 'Automation not found' ? 404 : 400).json({ error: message })
    }
  }

  delete: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    if (await this.requireActionAccess(req, res)) return

    try {
      await this.automations.delete(String(req.params['automationId']))
      res.status(204).send()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete automation'
      res.status(message === 'Automation not found' ? 404 : 400).json({ error: message })
    }
  }

  private async requireActionAccess(req: Request, res: Response): Promise<boolean> {
    const token = AuthController.readToken(req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return true
    }

    try {
      await this.auth.requireActionUser(token)
      return false
    } catch (error) {
      const message = error instanceof Error ? error.message : 'not_authorized'
      res.status(message === 'not_authorized' ? 403 : 500).json({ error: message })
      return true
    }
  }
}
