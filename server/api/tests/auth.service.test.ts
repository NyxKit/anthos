import { beforeEach, describe, expect, it, vi } from 'vitest'
import initSqlJs, { type Database } from 'sql.js'

import { UserRole } from '@anthos/shared'

import { AuthService } from '../src/services/AuthService.js'
import { UserService } from '../src/services/UserService.js'
import { hashSessionToken } from '../src/services/credentialSecurity.js'

async function createDb(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      display_name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `)

  return db
}

describe('AuthService', () => {
  let db: Database
  let saveDb: ReturnType<typeof vi.fn>
  let users: UserService
  let auth: AuthService

  beforeEach(async () => {
    db = await createDb()
    saveDb = vi.fn().mockResolvedValue(undefined)
    users = new UserService(db, saveDb)
    auth = new AuthService(db, users, saveDb)

    users.createUser({
      username: 'admin',
      displayName: 'Admin',
      email: 'admin@example.com',
      password: 'secret123',
      repeatPassword: 'secret123',
      setupMode: true,
    })
  })

  it('creates a session for valid credentials and clears it on logout', async () => {
    const session = await auth.login('admin', 'secret123')

    expect(session.user.username).toBe('admin')
    expect(session.user.role).toBe(UserRole.Admin)
    expect(saveDb).toHaveBeenCalledTimes(1)

    const tokenHash = hashSessionToken(session.token)
    const sessionRow = db.prepare('SELECT token_hash FROM sessions WHERE token_hash = ?')
    sessionRow.bind([tokenHash])
    expect(sessionRow.step()).toBe(true)
    sessionRow.free()

    await auth.logout(session.token)

    const deletedRow = db.prepare('SELECT token_hash FROM sessions WHERE token_hash = ?')
    deletedRow.bind([tokenHash])
    expect(deletedRow.step()).toBe(false)
    deletedRow.free()
    expect(saveDb).toHaveBeenCalledTimes(2)
  })

  it('rejects invalid credentials', async () => {
    await expect(auth.login('admin', 'wrong-password')).rejects.toThrow('invalid_credentials')
  })
})
