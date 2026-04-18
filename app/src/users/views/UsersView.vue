<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NyxButton, NyxTable, NyxIcon } from 'nyx-kit/components'
import { NyxShape, NyxSize, NyxTheme, NyxVariant } from 'nyx-kit/types'
import { User, UserRole } from '@anthos/shared/users'
import { useAuthStore } from '@/auth/stores/auth'
import { useUsersStore } from '@/users/stores/users'
import UserForm from '@/users/components/UserForm.vue'
import { UserFormMode } from '@/users/types'

const auth = useAuthStore()
const usersStore = useUsersStore()

const selectedUser = ref<User | null>(null)
const formRevision = ref(0)

onMounted(() => {
  void usersStore.fetchUsers()
})

function beginCreate(): void {
  selectedUser.value = null
  formRevision.value += 1
}

function beginEditById(userId: string): void {
  selectedUser.value = usersStore.users.find((user) => user.id === userId) ?? null
}

async function handleSave(payload: Record<string, unknown>): Promise<void> {
  try {
    if (selectedUser.value) {
      await usersStore.updateUser(selectedUser.value.id, {
        username: String(payload.username ?? ''),
        displayName: String(payload.displayName ?? ''),
        email: String(payload.email ?? ''),
        role: String(payload.role ?? UserRole.User) as UserRole,
      })
      beginCreate()
      return
    }

    await usersStore.createUser({
      username: String(payload.username ?? ''),
      displayName: String(payload.displayName ?? ''),
      email: String(payload.email ?? ''),
      password: String(payload.password ?? ''),
      repeatPassword: String(payload.repeatPassword ?? ''),
      role: String(payload.role ?? UserRole.User) as UserRole,
    })

    beginCreate()
  } catch {
    // Store already records the error state.
  }
}

async function handleDelete(userId: string): Promise<void> {
  const user = usersStore.users.find((item) => item.id === userId)
  if (!user) return

  if (!confirm(`Delete ${user.displayName}?`)) return
  try {
    await usersStore.deleteUser(user.id)
  } catch {
    // Store already records the error state.
  }
}

const formMode = computed(() => (selectedUser.value ? UserFormMode.Edit : UserFormMode.Create))
</script>

<template>
  <section class="users-view">
    <header class="users-view__header">
      <div>
        <p class="users-view__eyebrow">Anthos</p>
        <h1>Users</h1>
        <p class="users-view__subtitle">Manage user accounts and access.</p>
      </div>

      <div class="users-view__actions">
        <NyxButton :theme="NyxTheme.Primary" @click="beginCreate">Add user</NyxButton>
      </div>
    </header>

    <p v-if="auth.currentUser" class="users-view__meta">Signed in as {{ auth.currentUser.displayName || auth.currentUser.username }}</p>
    <p v-if="usersStore.error" class="users-view__error">{{ usersStore.error }}</p>

    <section class="users-view__form">
      <UserForm
        :key="`${selectedUser?.id ?? 'create'}:${formRevision}`"
        :mode="formMode"
        :user="selectedUser"
        :busy="usersStore.isLoading"
        @submit="handleSave"
        @cancel="beginCreate"
      />
    </section>

    <NyxTable
      v-model="usersStore.users"
      :size="NyxSize.Small"
      :col-include="['username', 'displayName', 'email', 'role']"
    >
      <template #actions="{ item }">
        <NyxButton
          :theme="NyxTheme.Primary"
          :size="NyxSize.Small"
          :shape="NyxShape.Square"
          :variant="NyxVariant.Subtle"
          @click="beginEditById(String(item.id))"
        >
          <NyxIcon name="pencil" :size="NyxSize.XSmall" />
        </NyxButton>
        <NyxButton
          :theme="NyxTheme.Danger"
          :size="NyxSize.Small"
          :shape="NyxShape.Square"
          :variant="NyxVariant.Subtle"
          @click="handleDelete(String(item.id))"
        >
          <NyxIcon name="trash" :size="NyxSize.XSmall" />
        </NyxButton>
      </template>
    </NyxTable>
  </section>
</template>

<style scoped>
.users-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.users-view__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.users-view__eyebrow {
  font-family: var(--nyx-font-family-mono, monospace);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--nyx-c-primary, #dcb8ff);
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.users-view h1 {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 2rem;
  margin: 0;
}

.users-view__subtitle,
.users-view__meta {
  color: var(--nyx-c-text-2, rgba(222, 227, 235, 0.8));
}

.users-view__form {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--nyx-c-surface-container, #1b2026);
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
}

.users-view__row-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.users-view__error {
  color: #ff9b9b;
}

@media (max-width: 768px) {
  .users-view__header {
    flex-direction: column;
  }
}
</style>
