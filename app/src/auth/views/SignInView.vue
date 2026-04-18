<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NyxButton, NyxFormField, NyxInput } from 'nyx-kit/components'
import { NyxInputType, NyxSize, NyxTheme } from 'nyx-kit/types'
import { useAuthStore } from '@/auth/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')

async function handleSubmit(): Promise<void> {
  try {
    await auth.login(username.value, password.value)
    await router.push('/users')
  } catch {
    // Store already records the error state.
  }
}
</script>

<template>
  <section class="auth-view">
    <div class="auth-view__card">
      <p class="auth-view__eyebrow">Anthos</p>
      <h1>Sign in</h1>
      <p class="auth-view__description">Access the Anthos user management console.</p>

      <form class="auth-view__form" @submit.prevent="handleSubmit">
        <NyxFormField label="Username">
          <NyxInput v-model="username" :size="NyxSize.Medium" :theme="NyxTheme.Info" />
        </NyxFormField>

        <NyxFormField label="Password">
          <NyxInput v-model="password" :size="NyxSize.Medium" :theme="NyxTheme.Info" :type="NyxInputType.Password" />
        </NyxFormField>

        <p v-if="auth.error" class="auth-view__error">{{ auth.error }}</p>

        <NyxButton :theme="NyxTheme.Primary" :size="NyxSize.Medium" :disabled="auth.isLoading" type="submit">
          Sign in
        </NyxButton>
      </form>
    </div>
  </section>
</template>

<style scoped>
.auth-view {
  min-height: calc(100vh - 4rem);
  display: grid;
  place-items: center;
  padding: 2rem;
}

.auth-view__card {
  width: min(100%, 420px);
  padding: 2rem;
  border-radius: 1rem;
  background: var(--nyx-c-surface-container, #1b2026);
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-view__eyebrow {
  font-family: var(--nyx-font-family-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--nyx-c-primary, #dcb8ff);
  font-size: 0.75rem;
}

.auth-view h1 {
  font-size: 2rem;
}

.auth-view__description {
  color: var(--nyx-c-text-2, rgba(222, 227, 235, 0.8));
}

.auth-view__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-view__error {
  color: #ff9b9b;
  font-size: 0.875rem;
}
</style>
