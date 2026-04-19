import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import anthos from '@anthos/shared/anthos'
import { User, type UserCreateInput, type UserSession, type UserUpdateInput } from '@anthos/shared/users'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const setupRequired = ref(false)
  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref<string | null>(null)

  const sortedUsers = computed(() => [...users.value].sort((a, b) => a.username.localeCompare(b.username)))

  function upsertUser(nextUser: User): void {
    const index = users.value.findIndex(user => user.id === nextUser.id)
    if (index === -1) {
      users.value = [...users.value, nextUser]
      return
    }

    const next = [...users.value]
    next[index] = nextUser
    users.value = next
  }

  async function loadSetupStatus(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.users.setupStatus()
      if (response.isFailure) {
        throw new Error(response.message)
      }

      setupRequired.value = response.value.setupRequired
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to load setup status'
    } finally {
      isReady.value = true
      isLoading.value = false
    }
  }

  async function fetchUsers(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.users.get()
      if (response.isFailure) {
        throw new Error(response.message)
      }

      users.value = response.value.map(user => user instanceof User ? user : new User(user))
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to fetch users'
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(input: UserCreateInput): Promise<User | UserSession> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.users.create(input)
      if (response.isFailure) {
        throw new Error(response.message)
      }

      if ('token' in response.value) {
        setupRequired.value = false
        return response.value
      }

      const user = response.value instanceof User ? response.value : new User(response.value)
      upsertUser(user)
      return user
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to create user'
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  async function updateUser(userId: string, input: UserUpdateInput): Promise<User> {
    isLoading.value = true
    error.value = null

    try {
      const updated = await anthos.users.update(userId, input)
      if (updated.isFailure) {
        throw new Error(updated.message)
      }

      const user = updated.value instanceof User ? updated.value : new User(updated.value)
      upsertUser(user)
      return user
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to update user'
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  async function deleteUser(userId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await anthos.users.delete(userId)
      if (response.isFailure) {
        throw new Error(response.message)
      }
      users.value = users.value.filter(user => user.id !== userId)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to delete user'
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  return {
    users: sortedUsers,
    setupRequired,
    isLoading,
    error,
    isReady,
    loadSetupStatus,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
})
