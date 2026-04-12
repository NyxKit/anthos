<script setup lang="ts">
import { NyxIcon } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import { useRoute } from 'vue-router'
import { logo } from '@/shared/assets'

const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'home' },
  { name: 'Nodes', path: '/nodes', icon: 'leaf' },
  { name: 'Logs', path: '/logs', icon: 'file-text' },
  { name: 'Alerts', path: '/alerts', icon: 'bell' },
  { name: 'Settings', path: '/settings', icon: 'settings' },
] as const

const supportItem = { name: 'Support', path: '/support', icon: 'life-buoy' } as const

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="sidebar-nav">
    <div class="sidebar-nav__brand">
      <img class="sidebar-nav__logo" :src="logo" alt="Anthos Logo" />
      <div class="sidebar-nav__title">
        <h1>Anthos</h1>
        <p>LIVING LABORATORY</p>
      </div>
    </div>
    
    <nav class="sidebar-nav__menu">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="sidebar-nav__link"
        :class="{ 'sidebar-nav__link--active': isActive(item.path) }"
      >
        <NyxIcon :name="item.icon" :size="NyxSize.Medium" />
        <span>{{ item.name }}</span>
      </router-link>
    </nav>
    
    <div class="sidebar-nav__footer">
      <router-link :to="supportItem.path" class="sidebar-nav__link">
        <NyxIcon :name="supportItem.icon" :size="NyxSize.Medium" />
        <span>{{ supportItem.name }}</span>
      </router-link>
    </div>
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

.sidebar-nav__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  color: var(--nyx-c-on-surface, #dee3eb);
  text-decoration: none;
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.sidebar-nav__link:hover {
  opacity: 1;
  background: var(--nyx-c-surface-container, #1b2026);
}

.sidebar-nav__link--active {
  opacity: 1;
  background: var(--nyx-c-surface-container-high, #252a30);
  color: var(--nyx-c-primary, #dcb8ff);
  border-right: 3px solid #9F50F0;
}

.sidebar-nav__footer {
  padding: 0 1rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
  padding-top: 1rem;
  margin-top: auto;
}

@media (max-width: 768px) {
  .sidebar-nav {
    display: none;
  }
}
</style>
