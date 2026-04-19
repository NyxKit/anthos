<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NyxActionItem, NyxButton, NyxForm, NyxFormField, NyxInput } from 'nyx-kit/components'
import { NyxKit } from 'nyx-kit'
import { NyxInputType, NyxSize, NyxTheme } from 'nyx-kit/types'
import anthos from '@anthos/shared/anthos'
import { User } from '@anthos/shared/users'
import { useAuthStore } from '@/auth/stores/auth'
import { RouteName } from '@/shared/types'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const displayName = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const error = ref<string | null>(null)
const isSaving = ref(false)
const currentUser = computed(() => auth.currentUser as User | null)

function syncFromUser(user: User | null): void {
  username.value = user?.username ?? ''
  displayName.value = user?.displayName ?? ''
  email.value = user?.email ?? ''
  password.value = ''
  repeatPassword.value = ''
}

watch(currentUser, user => {
  syncFromUser(user)
}, { immediate: true })

async function loadCurrentUser(): Promise<void> {
  if (currentUser.value) return

  const result = await anthos.users.me()
  if (result.isSuccess) {
    auth.setCurrentUser(result.value)
    syncFromUser(result.value)
  }
}

onMounted(() => {
  void loadCurrentUser()
})

function validate(): boolean {
  error.value = null

  if (!username.value.trim()) {
    error.value = 'Username is required.'
    return false
  }

  if (!displayName.value.trim()) {
    error.value = 'Display name is required.'
    return false
  }

  if (!email.value.trim()) {
    error.value = 'Email is required.'
    return false
  }

  if (password.value || repeatPassword.value) {
    if (!password.value) {
      error.value = 'Password is required.'
      return false
    }

    if (password.value !== repeatPassword.value) {
      error.value = 'Passwords do not match.'
      return false
    }
  }

  return true
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return

  isSaving.value = true
  try {
    const response = await anthos.users.updateMe({
      username: username.value.trim(),
      displayName: displayName.value.trim(),
      email: email.value.trim(),
      password: password.value.trim() ? password.value : undefined,
    })

    if (response.isFailure) {
      error.value = response.message === 'username_taken'
        ? 'Username is already in use.'
        : response.message === 'email_taken'
          ? 'Email is already in use.'
          : response.message
      return
    }

    auth.setCurrentUser(response.value)
    syncFromUser(response.value)
  } finally {
    isSaving.value = false
  }
}

async function handleSignOut(): Promise<void> {
  const confirmation = await NyxKit.confirm({
    title: 'Sign out',
    message: 'This will sign you out of your account on this device.',
    confirmText: 'Sign out',
    cancelText: 'Cancel',
    theme: NyxTheme.Secondary,
  })

  if (confirmation.isFailure) return

  await auth.logout()
  await router.push({ name: RouteName.Login })
}

async function handleDelete(): Promise<void> {
  const confirmation = await NyxKit.confirm({
    title: 'Delete account',
    message: 'This permanently deletes your account and signs you out.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    theme: NyxTheme.Danger,
  })

  if (confirmation.isFailure) return

  const response = await anthos.users.deleteMe()
  if (response.isFailure) {
    error.value = response.message
    return
  }

  auth.clearSession()
  await router.push({ name: RouteName.Login })
}
</script>

<template>
  <section class="account-view">
    <header class="account-view__header">
      <p class="account-view__eyebrow">Account</p>
      <h1>Manage your profile</h1>
      <p class="account-view__subtitle">Update your login details and account settings.</p>
    </header>

    <section class="account-view__card">
      <NyxForm class="account-view__form" @submit.prevent="handleSubmit">
        <NyxFormField label="Username">
          <template #default="{ id }">
            <NyxInput :id="id" v-model="username" :size="NyxSize.Medium" :theme="NyxTheme.Info" />
          </template>
        </NyxFormField>

        <NyxFormField label="Display name">
          <template #default="{ id }">
            <NyxInput :id="id" v-model="displayName" :size="NyxSize.Medium" :theme="NyxTheme.Info" />
          </template>
        </NyxFormField>

        <NyxFormField label="Email">
          <template #default="{ id }">
            <NyxInput :id="id" v-model="email" :size="NyxSize.Medium" :theme="NyxTheme.Info" :type="NyxInputType.Email" />
          </template>
        </NyxFormField>

        <NyxFormField label="New password">
          <template #default="{ id }">
            <NyxInput :id="id" v-model="password" :size="NyxSize.Medium" :theme="NyxTheme.Info" :type="NyxInputType.Password" />
          </template>
        </NyxFormField>

        <NyxFormField label="Repeat password">
          <template #default="{ id }">
            <NyxInput :id="id" v-model="repeatPassword" :size="NyxSize.Medium" :theme="NyxTheme.Info" :type="NyxInputType.Password" />
          </template>
        </NyxFormField>

        <p v-if="error" class="account-view__error">{{ error }}</p>

        <NyxFormField class="account-view__form-actions">
          <NyxButton :theme="NyxTheme.Primary" :size="NyxSize.Medium" :disabled="isSaving" type="submit">
            Save changes
          </NyxButton>
        </NyxFormField>
      </NyxForm>
    </section>

    <section class="account-view__actions">
      <h2 class="account-view__actions-title">Danger zone</h2>

      <NyxActionItem
        title="Sign out"
        action="Sign out"
        description="End this session on this device."
        :theme="NyxTheme.Secondary"
        @click="handleSignOut"
      />

      <NyxActionItem
        title="Delete account"
        action="Delete account"
        description="Permanently delete your account and sign out."
        :theme="NyxTheme.Danger"
        @click="handleDelete"
      />
    </section>
  </section>
</template>

<style scoped>
.account-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.account-view__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.account-view__eyebrow {
  font-family: var(--nyx-font-family-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--nyx-c-primary, #dcb8ff);
  font-size: 0.75rem;
}

.account-view h1 {
  margin: 0;
  font-size: 2rem;
}

.account-view__subtitle {
  color: var(--nyx-c-text-2, rgba(222, 227, 235, 0.8));
}

.account-view__card,
.account-view__actions {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--nyx-c-surface-container, #1b2026);
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
}

.account-view__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-view__form-actions {
  justify-content: flex-end;
}

.account-view__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.account-view__error {
  color: #ff9b9b;
}
</style>
