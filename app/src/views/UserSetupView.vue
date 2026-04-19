<script setup lang="ts">
import { useRouter } from 'vue-router'
import UserForm from '@/users/components/UserForm.vue'
import { useAuthStore } from '@/auth/stores/auth'
import { useUsersStore } from '@/users/stores/users'
import { UserFormMode } from '@/users/types'
import type { UserSession } from '@anthos/shared/users'

const router = useRouter()
const auth = useAuthStore()
const users = useUsersStore()

async function handleSubmit(payload: Record<string, unknown>): Promise<void> {
  try {
    const result = await users.createUser({
      username: String(payload.username ?? ''),
      displayName: String(payload.displayName ?? ''),
      email: String(payload.email ?? ''),
      password: String(payload.password ?? ''),
      repeatPassword: String(payload.repeatPassword ?? ''),
      setupMode: true,
    })

    if ('token' in result) {
      auth.applySession(result as UserSession)
      await router.push('/users')
    }
  } catch {
    // Store already records the error state.
  }
}
</script>

<template>
  <section class="setup-view">
    <div class="setup-view__card">
      <p class="setup-view__eyebrow">Anthos setup</p>
      <h1>Create the first admin</h1>
      <p class="setup-view__description">No users exist yet. Register the first administrator to unlock the app.</p>

      <UserForm
        :mode="UserFormMode.Setup"
        @submit="handleSubmit"
      />

      <p v-if="users.error" class="setup-view__error">{{ users.error }}</p>
    </div>
  </section>
</template>

<style scoped>
.setup-view {
  min-height: calc(100vh - 4rem);
  display: grid;
  place-items: center;
  padding: 2rem;
}

.setup-view__card {
  width: min(100%, 480px);
  padding: 2rem;
  border-radius: 1rem;
  background: var(--nyx-c-surface-container, #1b2026);
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setup-view__eyebrow {
  font-family: var(--nyx-font-family-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--nyx-c-primary, #dcb8ff);
  font-size: 0.75rem;
}

.setup-view h1 {
  font-size: 2rem;
}

.setup-view__description {
  color: var(--nyx-c-text-2, rgba(222, 227, 235, 0.8));
}

.setup-view__error {
  color: #ff9b9b;
  font-size: 0.875rem;
}
</style>
