import type { Database } from 'sql.js'

import { User, type UserSession } from '@anthos/shared/users'
import { createSessionToken, hashSessionToken, verifyPassword } from './credentialSecurity.js'
import { UserService } from './UserService.js'

interface SessionRow extends Record<string, unknown> {
  token_hash: string
  user_id: string
  created_at: number
  expires_at: number
}

export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly users: UserService,
    private readonly saveDb: () => Promise<void>
  ) {}

  async login(identifier: string, password: string): Promise<UserSession> {
    const user = this.users.getUserByLogin(identifier)
    if (!user) throw new Error('invalid_credentials')

    const passwordHash = this.users.getPasswordHashForUser(user.id)
    if (!passwordHash || !verifyPassword(password, passwordHash)) throw new Error('invalid_credentials')

    return this.createSession(user)
  }

  async logout(token: string): Promise<void> {
    const tokenHash = hashSessionToken(token)
    const stmt = this.db.prepare(`
      DELETE FROM sessions
      WHERE token_hash = ?
    `)
    stmt.run([tokenHash])
    stmt.free()
    await this.saveDb()
  }

  async getCurrentUser(token: string): Promise<User | null> {
    const session = this.getSessionByToken(token)
    if (!session) return null

    if (session.expires_at <= Date.now()) {
      await this.logout(token)
      return null
    }

    return this.users.getUserById(session.user_id)
  }

  async requireUser(token: string): Promise<User> {
    const user = await this.getCurrentUser(token)
    if (!user) throw new Error('not_authenticated')
    return user
  }

  async requireAdmin(token: string): Promise<User> {
    const user = await this.requireUser(token)
    if (!user.isAdmin) throw new Error('not_authorized')
    return user
  }

  async createSession(user: User): Promise<UserSession> {
    const token = createSessionToken()
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30
    const stmt = this.db.prepare(`
      INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run([hashSessionToken(token), user.id, Date.now(), expiresAt])
    stmt.free()
    await this.saveDb()

    return { token, user, expiresAt }
  }

  private getSessionByToken(token: string): SessionRow | null {
    const tokenHash = hashSessionToken(token)
    const stmt = this.db.prepare(`
      SELECT token_hash, user_id, created_at, expires_at
      FROM sessions
      WHERE token_hash = ?
      LIMIT 1
    `)
    stmt.bind([tokenHash])

    if (!stmt.step()) {
      stmt.free()
      return null
    }

    const row = stmt.getAsObject() as SessionRow
    stmt.free()
    return row
  }
}
