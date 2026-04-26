import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import anthos from '@anthos/shared/anthos'
import { User, type UserSession } from '@anthos/shared/users'
import { resolveApiBaseUrl } from '../../shared/utils/apiBaseUrl'

const TOKEN_KEY = 'anthos.session.token'
const API_BASE_URL = resolveApiBaseUrl()

function readStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  const token = localStorage.getItem(TOKEN_KEY)
  return token && token.length > 0 ? token : null
}

function writeStoredToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(TOKEN_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(readStoredToken())
  const setupRequired = ref(false)
  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const canPerformActions = computed(() => currentUser.value?.canPerformActions ?? false)
  const canInviteUsers = computed(() => currentUser.value?.canInviteUsers ?? false)

  function setApiSession(sessionToken: string | null): void {
    anthos.setup({
      apiBaseUrl: API_BASE_URL,
      ...(sessionToken ? { token: sessionToken } : {}),
    })
  }

  function applySession(session: UserSession): void {
    currentUser.value = session.user
    token.value = session.token
    writeStoredToken(session.token)
    setApiSession(session.token)
  }

  function clearSession(): void {
    currentUser.value = null
    token.value = null
    writeStoredToken(null)
    setApiSession(null)
  }

  function setCurrentUser(user: User | null): void {
    currentUser.value = user
  }

  async function bootstrap(): Promise<void> {
    if (isReady.value) return

    isLoading.value = true
    error.value = null

    try {
      const setupStatus = await anthos.users.setupStatus()
      if (setupStatus.isFailure) {
        throw new Error(setupStatus.message)
      }

      setupRequired.value = setupStatus.value.setupRequired

      const storedToken = readStoredToken()
      if (!setupRequired.value && storedToken) {
        setApiSession(storedToken)
        token.value = storedToken

        const userResult = await anthos.users.me()
        if (userResult.isSuccess) {
          currentUser.value = userResult.value
        } else {
          clearSession()
        }
      }

      if (setupRequired.value) {
        clearSession()
      }

      isReady.value = true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Failed to initialize session'
      clearSession()
    } finally {
      isReady.value = true
      isLoading.value = false
    }
  }

  async function login(username: string, password: string): Promise<User> {
    isLoading.value = true
    error.value = null

    try {
      const session = await anthos.users.login({ username, password })
      if (session.isFailure) {
        error.value = session.message
        throw new Error(session.message)
      }

      applySession(session.value)
      return session.value.user
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Login failed'
      throw cause
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      if (token.value) {
        try {
          const result = await anthos.users.logout()
          if (result.isFailure) {
            void result
          }
        } catch {
          // Session may already be expired server-side.
        }
      }
    } finally {
      clearSession()
      isLoading.value = false
    }
  }

  return {
    currentUser,
    token,
    setupRequired,
    isLoading,
    isReady,
    error,
    isAuthenticated,
    canPerformActions,
    canInviteUsers,
    bootstrap,
    login,
    logout,
    setCurrentUser,
    applySession,
    clearSession,
  }
})
