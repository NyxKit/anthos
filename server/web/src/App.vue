<script setup lang="ts">
</script>

<template>
  <div class="app">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--nyx-font-family-base, 'Inter', sans-serif);
  background-color: var(--nyx-c-bg, #0e0e10);
  color: var(--nyx-c-text-1, #e6e4ec);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  padding: 1rem;
}
</style>
