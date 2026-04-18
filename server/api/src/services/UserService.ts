import type { Database } from 'sql.js'
import { randomUUID } from 'node:crypto'

import { User, type UserCreateInput, type UserUpdateInput, UserRole } from '@anthos/shared/users'
import { hashPassword } from './credentialSecurity.js'

interface UserRow extends Record<string, unknown> {
  id: string
  username: string
  display_name: string
  email: string
  password_hash: string
  role: string
  created_at: number
}

export class UserService {
  constructor(
    private readonly db: Database,
    private readonly saveDb: () => Promise<void>
  ) {}

  setupRequired(): boolean {
    return this.countUsers() === 0
  }

  listUsers(): User[] {
    const stmt = this.db.prepare(`
      SELECT id, username, display_name, email, role, created_at
      FROM users
      ORDER BY created_at ASC, username ASC
    `)

    const users: User[] = []
    while (stmt.step()) {
      users.push(User.from(stmt.getAsObject()))
    }

    stmt.free()
    return users
  }

  getUserById(id: string): User | null {
    const row = this.getUserRowById(id)
    return row ? this.rowToUser(row) : null
  }

  getUserByUsername(username: string): User | null {
    const row = this.getUserRowByUsername(username)
    return row ? this.rowToUser(row) : null
  }

  getUserByLogin(identifier: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, username, display_name, email, password_hash, role, created_at
      FROM users
      WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE
      LIMIT 1
    `)
    stmt.bind([identifier, identifier])

    if (!stmt.step()) {
      stmt.free()
      return null
    }

    const row = stmt.getAsObject() as UserRow
    stmt.free()
    return this.rowToUser(row)
  }

  getPasswordHashForUser(userId: string): string | null {
    const row = this.getUserRowById(userId)
    return row ? row.password_hash : null
  }

  createUser(input: UserCreateInput): User {
    this.assertValidCreate(input)

    const now = Date.now()
    const role = input.setupMode || this.setupRequired() ? UserRole.Admin : (input.role ?? UserRole.User)
    const user: User = new User({
      id: randomUUID(),
      username: input.username.trim(),
      displayName: input.displayName.trim(),
      email: input.email.trim(),
      role,
      createdAt: now,
    })

    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, display_name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run([
      user.id,
      user.username,
      user.displayName,
      user.email,
      hashPassword(input.password),
      user.role,
      user.createdAt,
    ])
    stmt.free()

    return user
  }

  updateUser(userId: string, input: UserUpdateInput): User {
    const current = this.getUserRowById(userId)
    if (!current) throw new Error('user_not_found')

    const nextUsername = (input.username ?? current.username).trim()
    const nextDisplayName = (input.displayName ?? current.display_name).trim()
    const nextEmail = (input.email ?? current.email).trim()
    const nextRole = input.role ?? (current.role as UserRole)

    this.assertUnique(nextUsername, nextEmail, userId)

    const stmt = this.db.prepare(`
      UPDATE users
      SET username = ?, display_name = ?, email = ?, role = ?
      WHERE id = ?
    `)
    stmt.run([nextUsername, nextDisplayName, nextEmail, nextRole, userId])
    stmt.free()

    if (input.password) {
      const passwordStmt = this.db.prepare(`
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
      `)
      passwordStmt.run([hashPassword(input.password), userId])
      passwordStmt.free()
    }

    const updated = this.getUserRowById(userId)
    if (!updated) throw new Error('user_not_found')
    return this.rowToUser(updated)
  }

  deleteUser(userId: string): boolean {
    const existing = this.getUserRowById(userId)
    if (!existing) return false

    const stmt = this.db.prepare(`
      DELETE FROM users
      WHERE id = ?
    `)
    stmt.run([userId])
    stmt.free()

    return this.getUserRowById(userId) === null
  }

  async persist(): Promise<void> {
    await this.saveDb()
  }

  private countUsers(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) AS count FROM users')
    stmt.step()
    const row = stmt.getAsObject() as Record<string, unknown>
    stmt.free()
    return Number(row['count'] ?? 0)
  }

  private getUserRowById(userId: string): UserRow | null {
    const stmt = this.db.prepare(`
      SELECT id, username, display_name, email, password_hash, role, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `)
    stmt.bind([userId])

    if (!stmt.step()) {
      stmt.free()
      return null
    }

    const row = stmt.getAsObject() as UserRow
    stmt.free()
    return row
  }

  private getUserRowByUsername(username: string): UserRow | null {
    const stmt = this.db.prepare(`
      SELECT id, username, display_name, email, password_hash, role, created_at
      FROM users
      WHERE username = ? COLLATE NOCASE
      LIMIT 1
    `)
    stmt.bind([username])

    if (!stmt.step()) {
      stmt.free()
      return null
    }

    const row = stmt.getAsObject() as UserRow
    stmt.free()
    return row
  }

  private assertValidCreate(input: UserCreateInput): void {
    if (!input.username?.trim()) throw new Error('username_required')
    if (!input.displayName?.trim()) throw new Error('display_name_required')
    if (!input.email?.trim()) throw new Error('email_required')
    if (!input.password) throw new Error('password_required')
    if (!input.repeatPassword) throw new Error('repeat_password_required')
    if (input.password !== input.repeatPassword) throw new Error('password_mismatch')

    if (!input.setupMode && !input.role) throw new Error('role_required')

    this.assertUnique(input.username.trim(), input.email.trim())
  }

  private assertUnique(username: string, email: string, ignoreUserId?: string): void {
    const stmt = this.db.prepare(`
      SELECT id
      FROM users
      WHERE (username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE)
        AND (? = '' OR id <> ?)
      LIMIT 1
    `)
    stmt.bind([username, email, ignoreUserId ?? '', ignoreUserId ?? ''])
    const hasDuplicate = stmt.step()
    stmt.free()

    if (hasDuplicate) throw new Error('user_conflict')
  }

  private rowToUser(row: UserRow): User {
    return new User({
      id: row.id,
      username: row.username,
      displayName: row.display_name,
      email: row.email,
      role: row.role as UserRole,
      createdAt: Number(row.created_at),
    })
  }
}
