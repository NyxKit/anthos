import type { Request, Response, RequestHandler } from 'express'

import { AuthService } from '../services/AuthService.js'

const readToken = (req: Request): string | null => {
  const header = req.header('authorization') ?? req.header('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice('Bearer '.length).trim()
  return token.length > 0 ? token : null
}

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body as { username?: string; password?: string }

    if (!username || !password) {
      res.status(400).json({ error: 'username_and_password_required' })
      return
    }

    try {
      const session = await this.auth.login(username, password)
      res.json(session)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid_credentials'
      res.status(message === 'invalid_credentials' ? 401 : 500).json({ error: message })
    }
  }

  logout: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const token = readToken(req)
    if (!token) {
      res.status(401).json({ error: 'not_authenticated' })
      return
    }

    await this.auth.logout(token)
    res.status(204).send()
  }

  me: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const token = readToken(req)
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

  static readToken(req: Request): string | null {
    return readToken(req)
  }
}
