<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NyxButton, NyxForm, NyxFormField, NyxInput, NyxSelect } from 'nyx-kit/components'
import { NyxInputType, NyxSize, NyxTheme, NyxVariant, type NyxSelectOption } from 'nyx-kit/types'
import { User, UserRole } from '@anthos/shared/users'
import { UserFormMode } from '@/users/types'

interface UserFormValues {
  username: string
  displayName: string
  email: string
  password: string
  repeatPassword: string
  role: UserRole
}

interface Props {
  mode: UserFormMode
  user?: User | null
  allowRoleSelection?: boolean
  busy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  allowRoleSelection: true,
  busy: false,
})

const emit = defineEmits<{
  submit: [payload: Partial<UserFormValues>]
  cancel: []
}>()

const roleOptions: NyxSelectOption<UserRole>[] = Object.values(UserRole).map(role => ({
  label: role.charAt(0).toUpperCase() + role.slice(1),
  value: role,
}))

const includeRole = computed(() => props.mode !== UserFormMode.Setup)
const includePasswordFields = computed(() => props.mode !== UserFormMode.Edit)
const submitLabel = computed(() => {
  switch (props.mode) {
    case UserFormMode.Setup:
      return 'Create admin'
    case UserFormMode.Edit:
      return 'Save changes'
    default:
      return 'Create user'
  }
})
const cancelLabel = computed(() => (props.mode === UserFormMode.Edit ? 'Cancel edit' : 'Reset'))

const username = ref('')
const displayName = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const role = ref<UserRole>(UserRole.User)
const error = ref<string | null>(null)

const isEditMode = computed(() => props.mode === UserFormMode.Edit)

function syncFromUser(user: User | null | undefined): void {
  if (!user) {
    username.value = ''
    displayName.value = ''
    email.value = ''
    password.value = ''
    repeatPassword.value = ''
    role.value = UserRole.User
    return
  }

  username.value = user.username
  displayName.value = user.displayName
  email.value = user.email
  password.value = ''
  repeatPassword.value = ''
  role.value = user.role
}

watch(() => props.user, user => {
  syncFromUser(user)
}, { immediate: true })

function handleSubmit(): void {
  error.value = null

  if (!username.value.trim()) {
    error.value = 'Username is required.'
    return
  }

  if (!displayName.value.trim()) {
    error.value = 'Display name is required.'
    return
  }

  if (!email.value.trim()) {
    error.value = 'Email is required.'
    return
  }

  if (includePasswordFields.value) {
    if (!password.value) {
      error.value = 'Password is required.'
      return
    }

    if (password.value !== repeatPassword.value) {
      error.value = 'Passwords do not match.'
      return
    }
  }

  emit('submit', {
    username: username.value.trim(),
    displayName: displayName.value.trim(),
    email: email.value.trim(),
    password: includePasswordFields.value ? password.value : '',
    repeatPassword: includePasswordFields.value ? repeatPassword.value : '',
    role: includeRole.value ? role.value : UserRole.User,
  })

  if (!isEditMode.value) {
    password.value = ''
    repeatPassword.value = ''
  }
}

function handleCancel(): void {
  error.value = null
  emit('cancel')
}
</script>

<template>
  <NyxForm class="user-form" @submit.prevent="handleSubmit">
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

    <NyxFormField v-if="includeRole" label="Role">
      <template #default="{ id }">
        <NyxSelect :id="id" v-model="role" :options="roleOptions" :disabled="!allowRoleSelection" placeholder="Choose role" />
      </template>
    </NyxFormField>

    <template v-if="includePasswordFields">
      <NyxFormField label="Password">
        <template #default="{ id }">
          <NyxInput :id="id" v-model="password" :size="NyxSize.Medium" :theme="NyxTheme.Info" :type="NyxInputType.Password" />
        </template>
      </NyxFormField>

      <NyxFormField label="Repeat password" :helper-text="password.length > 0 ? 'Passwords match' : 'Passwords do not match'">
        <template #default="{ id }">
          <NyxInput :id="id" v-model="repeatPassword" :size="NyxSize.Medium" :theme="NyxTheme.Info" :type="NyxInputType.Password" />
        </template>
      </NyxFormField>
    </template>

    <p v-if="error" class="user-form__error">{{ error }}</p>

    <NyxFormField class="user-form__actions">
      <NyxButton
        v-if="mode !== UserFormMode.Setup"
        :theme="NyxTheme.Secondary"
        :size="NyxSize.Medium"
        :variant="NyxVariant.Subtle"
        :disabled="busy"
        type="button"
        @click="handleCancel"
      >
        {{ cancelLabel }}
      </NyxButton>
      <NyxButton
        :theme="NyxTheme.Success"
        :size="NyxSize.Medium"
        :disabled="busy"
        type="submit"
      >
        {{ submitLabel }}
      </NyxButton>
    </NyxFormField>
  </NyxForm>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-form__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.user-form__error {
  color: #ff9b9b;
  font-size: 0.875rem;
}
</style>
