<script setup lang="ts">
import { computed } from 'vue'
import { logo } from '@/shared/assets'
import { useAuthStore } from '@/auth/stores/auth'
import { AnthosRouteItem, RouteName } from '@/shared/types'
import NavItem from './NavItem.vue'

const auth = useAuthStore()

const navItems: AnthosRouteItem[] = [
  { name: RouteName.Dashboard, icon: 'home', label: 'Dashboard' },
  { name: RouteName.Nodes, icon: 'leaf', label: 'Nodes' },
  { name: RouteName.Automations, icon: 'zap', label: 'Automations' },
  // { name: RouteName.Alerts, icon: 'bell', label: 'Alerts' },
  { name: RouteName.Users, icon: 'users', label: 'Users' },
  // { name: RouteName.Settings, icon: 'settings', label: 'Settings' },
  { name: RouteName.Logs, icon: 'file-text', label: 'Logs' },
] as const

const currentUserLabel = computed(() => auth.currentUser?.displayName || auth.currentUser?.username || 'Signed in')
</script>

<template>
  <aside class="sidebar-nav">
    <header class="sidebar-nav__brand">
      <img class="sidebar-nav__logo" :src="logo" alt="Anthos Logo" />
      <div class="sidebar-nav__title">
        <h1>Anthos</h1>
        <p>LIVING LABORATORY</p>
      </div>
    </header>
    
    <nav class="sidebar-nav__menu">
      <NavItem
        v-for="item in navItems"
        :key="item.name"
        :name="item.name"
        :icon="item.icon"
        :label="item.label"
      />
    </nav>

    <footer class="sidebar-nav__footer">
      <NavItem
        :name="RouteName.Account"
        icon="user"
        :label="currentUserLabel"
      />
    </footer>
  </aside>
</template>

<style scoped>
.sidebar-nav {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 256px;
  background: var(--nyx-c-surface-container-low, #171c22);
  border-right: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.3));
  display: flex;
  flex-direction: column;
  padding: 2rem 0;
  z-index: 40;
}

.sidebar-nav__brand {
  padding: 0 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-nav__logo {
  width: 3rem;
  height: auto;
}

.sidebar-nav__title h1 {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--nyx-c-primary, #dcb8ff);
  letter-spacing: -0.025em;
  margin: 0;
}

.sidebar-nav__title p {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  letter-spacing: 0.2em;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
  margin-top: 0.25rem;
  text-transform: uppercase;
}

.sidebar-nav__menu {
  flex: 1;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-nav__footer {
  padding: 0 1rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
  padding-top: 1rem;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-nav__user {
  font-size: 0.875rem;
  color: var(--nyx-c-text-2, rgba(222, 227, 235, 0.8));
  padding: 0 1rem;
}

.sidebar-nav__logout {
  margin: 0 1rem;
}

@media (max-width: 768px) {
  .sidebar-nav {
    display: none;
  }
}
</style>
