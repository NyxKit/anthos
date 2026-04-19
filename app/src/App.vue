<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNav from '@/dashboard/components/SidebarNav.vue'

const route = useRoute()
const showShell = computed(() => route.meta.hideShell !== true)
</script>

<template>
  <div class="app-layout">
    <SidebarNav v-if="showShell" />
    <div class="app-layout__main" :class="{ 'app-layout__main--full': !showShell }">
      <main class="app-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--nyx-font-family-base, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
  background: var(--nyx-c-surface-dim, #0f1419);
  color: var(--nyx-c-on-surface, #dee3eb);
  min-height: 100vh;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-layout__main {
  flex: 1;
  margin-left: 256px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-layout__main--full {
  margin-left: 0;
}

.app-layout__content {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 768px) {
  .app-layout__main {
    margin-left: 0;
  }
}
</style>
