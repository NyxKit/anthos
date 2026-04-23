import type { User } from '../../users/classes/User.js'

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export interface UserRecord {
  id: string
  username: string
  displayName: string
  email: string
  role: UserRole
  createdAt: number
}

export interface UserCredentials {
  username: string
  password: string
}

export interface UserCreateInput {
  username: string
  displayName: string
  email: string
  password: string
  repeatPassword: string
  role?: UserRole
  setupMode?: boolean
}

export interface UserUpdateInput {
  username?: string
  displayName?: string
  email?: string
  password?: string
  role?: UserRole
}

export interface UserSession {
  token: string
  user: User
  expiresAt?: number | null
}

export interface SetupStatus {
  setupRequired: boolean
}
