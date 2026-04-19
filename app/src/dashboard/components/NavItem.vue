<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NyxIcon } from 'nyx-kit/components'
import { AnthosRouteItem } from '@/shared/types'
import { NyxSize } from 'nyx-kit/types'

const props = defineProps<AnthosRouteItem>()
const route = useRoute()

const isActive = computed(() => props.name === route.name)

</script>

<template>
  <router-link
    :to="{ name: props.name }"
    class="nav-item"
    :class="{ 'nav-item--active': isActive }"
  >
    <NyxIcon :name="props.icon" :size="NyxSize.Medium" />
    <span>{{ props.label }}</span>
  </router-link>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  color: var(--nyx-c-text-2);
  text-decoration: none;
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.nav-item:hover {
  opacity: 1;
  background: var(--nyx-c-bg-mute);
}

.nav-item--active {
  opacity: 1;
  background: var(--nyx-c-bg-mute);
  color: var(--nyx-c-primary);
  border-right: 3px solid var(--nyx-c-primary);
}
</style>
