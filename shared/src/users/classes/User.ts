import { NyxLoader } from 'nyx-kit/classes'

import type { UserRecord } from '../../anthos/types/index.js'
import { UserRole } from '../../anthos/types/index.js'

export class User implements UserRecord {
  id = ''
  username = ''
  displayName = ''
  email = ''
  role: UserRole = UserRole.User
  createdAt = 0

  constructor(data?: unknown) {
    if (!data) return

    this.id = NyxLoader.loadString(data, ['id', 'userId'], this.id)
    this.username = NyxLoader.loadString(data, 'username', this.username)
    this.displayName = NyxLoader.loadStringOrNull(data, ['displayName', 'display_name'], this.displayName) ?? ''
    this.email = NyxLoader.loadString(data, 'email', this.email)
    this.role = NyxLoader.loadEnum<UserRole>(data, 'role', this.role, Object.values(UserRole))
    this.createdAt = NyxLoader.loadNumber(data, ['createdAt', 'created_at'], this.createdAt)
  }

  static from(data: unknown): User {
    return new User(data)
  }

  get isAdmin(): boolean {
    return this.role === UserRole.Admin
  }

  get isGuest(): boolean {
    return this.role === UserRole.Guest
  }

  get canInviteUsers(): boolean {
    return this.isAdmin
  }

  get canPerformActions(): boolean {
    return this.role === UserRole.Admin || this.role === UserRole.User
  }

  toJSON(): UserRecord {
    return {
      id: this.id,
      username: this.username,
      displayName: this.displayName,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    }
  }
}
