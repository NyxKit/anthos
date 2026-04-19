import type { Anthos } from './Anthos.js'
import { NyxResult } from 'nyx-kit/classes'

import { User } from '../../users/classes/User.js'
import { UserRole, type SetupStatus, type UserCreateInput, type UserCredentials, type UserSession, type UserUpdateInput } from '../types/index.js'

type AnthosUsersError = string

export class AnthosUsers {
  constructor(protected readonly anthos: Anthos) {
    void this.anthos
  }

  async login(credentials: UserCredentials): Promise<NyxResult<UserSession, AnthosUsersError>> {
    const response = await this.request<{ token: string, user: unknown, expiresAt?: number | null }>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })

    if (response.isFailure) return response.convert<UserSession>()

    return NyxResult.success({
      token: response.value.token,
      user: User.from(response.value.user),
      expiresAt: response.value.expiresAt ?? null,
    })
  }

  async logout(): Promise<NyxResult<void, AnthosUsersError>> {
    return this.request<void>('/api/auth/logout', { method: 'POST' })
  }

  async get(): Promise<NyxResult<User[], AnthosUsersError>>
  async get(userId: string): Promise<NyxResult<User, AnthosUsersError>>
  async get(userId?: string): Promise<NyxResult<User | User[], AnthosUsersError>> {
    const path = userId ? `/api/users/${userId}` : '/api/users'
    const response = await this.request<{ user?: unknown, users?: unknown[] } | unknown>(path)

    if (response.isFailure) {
      return userId ? response.convert<User>() : response.convert<User[]>()
    }

    if (!userId) {
      const payload = response.value as { users?: unknown[] }
      return NyxResult.success((payload.users ?? []).map(item => User.from(item)))
    }

    const payload = response.value as { user?: unknown } | unknown
    if (payload && typeof payload === 'object' && 'user' in payload) {
      const user = (payload as { user?: unknown }).user
      return user ? NyxResult.success(User.from(user)) : NyxResult.fail<User, AnthosUsersError>('invalid_response', 'Missing user payload')
    }

    return NyxResult.success(User.from(response.value))
  }

  async create(input: UserCreateInput): Promise<NyxResult<UserSession | User, AnthosUsersError>> {
    const response = await this.request<{ token?: string, user: unknown, expiresAt?: number | null }>('/api/users', {
      method: 'POST',
      body: input,
    })

    if (response.isFailure) return response.convert<UserSession | User>()

    if (input.setupMode || response.value.token) {
      return NyxResult.success({
        token: response.value.token ?? '',
        user: User.from(response.value.user),
        expiresAt: response.value.expiresAt ?? null,
      })
    }

    return NyxResult.success(User.from(response.value.user))
  }

  async update(userId: string, input: UserUpdateInput): Promise<NyxResult<User, AnthosUsersError>> {
    const response = await this.request<{ user: unknown }>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: input,
    })

    if (response.isFailure) return response.convert<User>()

    return NyxResult.success(User.from(response.value.user))
  }

  async delete(userId: string): Promise<NyxResult<void, AnthosUsersError>> {
    return this.request<void>(`/api/users/${userId}`, { method: 'DELETE' })
  }

  async setupStatus(): Promise<NyxResult<SetupStatus, AnthosUsersError>> {
    return this.request<SetupStatus>('/api/users/setup-status')
  }

  async me(): Promise<NyxResult<User, AnthosUsersError>> {
    return this.get('me')
  }

  async updateMe(input: UserUpdateInput): Promise<NyxResult<User, AnthosUsersError>> {
    return this.update('me', input)
  }

  async deleteMe(): Promise<NyxResult<void, AnthosUsersError>> {
    return this.delete('me')
  }

  static adminRole(): UserRole {
    return UserRole.Admin
  }

  private async request<T>(path: string, options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {}): Promise<NyxResult<T, AnthosUsersError>> {
    try {
      const response = await this.anthos.request<T>(path, options)
      return NyxResult.success<T, AnthosUsersError>(response)
    } catch (error) {
      return NyxResult.fail<T, AnthosUsersError>('request_failed', error instanceof Error ? error.message : 'Anthos request failed')
    }
  }
}
