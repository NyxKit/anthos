import type { Request, Response, RequestHandler } from 'express'

import { AuthController } from './AuthController.js'
import { AuthService } from '../services/AuthService.js'
import { UserService } from '../services/UserService.js'
import { UserRole } from '@anthos/shared/users'

export class UserController {
  constructor(
    private readonly users: UserService,
    private readonly auth: AuthService
  ) {}

  setupStatus: RequestHandler = (_req: Request, res: Response): void => {
    res.json({ setupRequired: this.users.setupRequired() })
  }

  list: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = this.readToken(req)
      if (!token) {
        res.status(401).json({ error: 'not_authenticated' })
        return
      }

      await this.auth.requireAdmin(token)
      res.json({ users: this.users.listUsers() })
    } catch (error) {
      this.handleAuthError(error, res)
    }
  }

  me: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const token = this.readToken(req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    const user = await this.auth.getCurrentUser(token)
    if (!user) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    res.json({ user })
  }

  get: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = this.readToken(req)
      if (!token) {
        res.status(401).json({ error: 'not_authenticated' })
        return
      }

      await this.auth.requireAdmin(token)
      const user = this.users.getUserById(String(req.params['id']))
      if (!user) {
        res.status(404).json({ error: 'user_not_found' })
        return
      }

      res.json({ user })
    } catch (error) {
      this.handleAuthError(error, res)
    }
  }

  create: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as Record<string, unknown>
    const setupMode = this.users.setupRequired()
    const token = this.readToken(req)

    if (!setupMode) {
      if (!token) {
        res.status(401).json({ error: 'not_authenticated' })
        return
      }

      try {
        await this.auth.requireAdmin(token)
      } catch (error) {
        this.handleAuthError(error, res)
        return
      }
    }

    try {
      const user = this.users.createUser({
        username: String(payload['username'] ?? ''),
        displayName: String(payload['displayName'] ?? ''),
        email: String(payload['email'] ?? ''),
        password: String(payload['password'] ?? ''),
        repeatPassword: String(payload['repeatPassword'] ?? ''),
        role: payload['role'] === UserRole.Admin ? UserRole.Admin : payload['role'] === UserRole.User ? UserRole.User : undefined,
        setupMode,
      })

      await this.users.persist()

      if (setupMode) {
        const session = await this.auth.createSession(user)
        res.status(201).json({ user: session.user, token: session.token, expiresAt: session.expiresAt })
        return
      }

      res.status(201).json({ user })
    } catch (error) {
      this.handleUserError(error, res)
    }
  }

  update: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = this.readToken(req)
      if (!token) {
        res.status(401).json({ error: 'not_authenticated' })
        return
      }

      await this.auth.requireAdmin(token)

      const user = this.users.updateUser(String(req.params['id']), {
        username: req.body?.username ? String(req.body.username) : undefined,
        displayName: req.body?.displayName ? String(req.body.displayName) : undefined,
        email: req.body?.email ? String(req.body.email) : undefined,
        password: req.body?.password ? String(req.body.password) : undefined,
        role: req.body?.role === UserRole.Admin ? UserRole.Admin : req.body?.role === UserRole.User ? UserRole.User : undefined,
      })

      await this.users.persist()
      res.json({ user })
    } catch (error) {
      this.handleUserError(error, res)
    }
  }

  delete: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = this.readToken(req)
      if (!token) {
        res.status(401).json({ error: 'not_authenticated' })
        return
      }

      await this.auth.requireAdmin(token)
      const deleted = this.users.deleteUser(String(req.params['id']))

      if (!deleted) {
        res.status(404).json({ error: 'user_not_found' })
        return
      }

      await this.users.persist()
      res.status(204).send()
    } catch (error) {
      this.handleAuthError(error, res)
    }
  }

  private readToken(req: Request): string | null {
    return AuthController.readToken(req)
  }

  private handleAuthError(error: unknown, res: Response): void {
    const message = error instanceof Error ? error.message : 'unknown_error'
    if (message === 'not_authenticated') {
      res.status(401).json({ error: message })
      return
    }

    if (message === 'not_authorized') {
      res.status(403).json({ error: message })
      return
    }

    res.status(500).json({ error: message })
  }

  private handleUserError(error: unknown, res: Response): void {
    const message = error instanceof Error ? error.message : 'unknown_error'
    if (message === 'username_required' || message === 'display_name_required' || message === 'email_required' || message === 'password_required' || message === 'repeat_password_required' || message === 'role_required') {
      res.status(400).json({ error: message })
      return
    }

    if (message === 'password_mismatch') {
      res.status(400).json({ error: message })
      return
    }

    if (message === 'user_conflict') {
      res.status(409).json({ error: message })
      return
    }

    if (message === 'user_not_found') {
      res.status(404).json({ error: message })
      return
    }

    this.handleAuthError(error, res)
  }
}
