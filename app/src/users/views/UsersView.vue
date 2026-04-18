<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NyxButton, NyxModal, NyxTable, NyxIcon } from 'nyx-kit/components'
import { NyxKit } from 'nyx-kit'
import { NyxShape, NyxSize, NyxTheme, NyxVariant } from 'nyx-kit/types'
import { User, UserRole } from '@anthos/shared/users'
import { useAuthStore } from '@/auth/stores/auth'
import { useUsersStore } from '@/users/stores/users'
import UserForm from '@/users/components/UserForm.vue'
import { UserFormMode } from '@/users/types'

const auth = useAuthStore()
const usersStore = useUsersStore()

const selectedUser = ref<User | null>(null)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)

onMounted(() => {
  void usersStore.fetchUsers()
})

function beginCreate(): void {
  selectedUser.value = null
  isEditModalOpen.value = false
  isCreateModalOpen.value = true
}

function beginEditById(userId: string): void {
  selectedUser.value = usersStore.users.find((user) => user.id === userId) ?? null
  if (selectedUser.value) {
    isCreateModalOpen.value = false
    isEditModalOpen.value = true
  }
}

async function handleCreate(payload: Record<string, unknown>): Promise<void> {
  try {
    await usersStore.createUser({
      username: String(payload.username ?? ''),
      displayName: String(payload.displayName ?? ''),
      email: String(payload.email ?? ''),
      password: String(payload.password ?? ''),
      repeatPassword: String(payload.repeatPassword ?? ''),
      role: String(payload.role ?? UserRole.User) as UserRole,
    })
    isCreateModalOpen.value = false
  } catch {
    // Store already records the error state.
  }
}

async function handleEdit(payload: Record<string, unknown>): Promise<void> {
  if (!selectedUser.value) return

  try {
    await usersStore.updateUser(selectedUser.value.id, {
      username: String(payload.username ?? ''),
      displayName: String(payload.displayName ?? ''),
      email: String(payload.email ?? ''),
      role: String(payload.role ?? UserRole.User) as UserRole,
    })
    isEditModalOpen.value = false
  } catch {
    // Store already records the error state.
  }
}

async function handleDelete(userId: string): Promise<void> {
  const user = usersStore.users.find((item) => item.id === userId)
  if (!user) return

  const confirmation = await NyxKit.confirm({
    title: 'Delete user',
    message: `Delete ${user.displayName || user.username}?`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
  })

  if (confirmation.isFailure) return

  try {
    await usersStore.deleteUser(user.id)
  } catch {
    // Store already records the error state.
  }
}

const isEditingSelf = computed(() => selectedUser.value?.id === auth.currentUser?.id)
</script>

<template>
  <section class="users-view">
    <header class="users-view__header">
      <p class="users-view__subtitle">Manage user accounts and access.</p>
      <div class="users-view__actions">
        <NyxButton :theme="NyxTheme.Primary" @click="beginCreate">Add user</NyxButton>
      </div>
    </header>

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
          :disabled="String(item.id) === auth.currentUser?.id"
          @click="handleDelete(String(item.id))"
        >
          <NyxIcon name="trash" :size="NyxSize.XSmall" />
        </NyxButton>
      </template>
    </NyxTable>

    <NyxModal v-model="isCreateModalOpen" :size="NyxSize.Medium" :theme="NyxTheme.Primary">
      <template #header>
        <h2 class="users-view__modal-title">Create user</h2>
      </template>

      <UserForm
        :mode="UserFormMode.Create"
        :busy="usersStore.isLoading"
        @submit="handleCreate"
        @cancel="isCreateModalOpen = false"
      />
    </NyxModal>

    <NyxModal v-model="isEditModalOpen" :size="NyxSize.Medium" :theme="NyxTheme.Primary">
      <template #header>
        <h2 class="users-view__modal-title">Edit user</h2>
      </template>

      <UserForm
        :key="selectedUser?.id ?? 'edit'"
        :mode="UserFormMode.Edit"
        :user="selectedUser"
        :allow-role-selection="!isEditingSelf"
        :busy="usersStore.isLoading"
        @submit="handleEdit"
        @cancel="isEditModalOpen = false"
      />
    </NyxModal>
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

.users-view__subtitle {
  color: var(--nyx-c-text-2, rgba(222, 227, 235, 0.8));
}

.users-view__modal-title {
  margin: 0;
}

@media (max-width: 768px) {
  .users-view__header {
    flex-direction: column;
  }
}
</style>
