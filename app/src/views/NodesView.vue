<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="nodes-view">
    <div class="header">
      <button class="back-btn" @click="router.push('/')">&#8592;</button>
      <h1 class="header-title">Nodes</h1>
    </div>
    <div class="content">
      <p class="coming-soon">Coming soon</p>
    </div>
  </div>
</template>

<style scoped>
.nodes-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e0e10;
  color: #e6e4ec;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 12px;
  border-bottom: 1px solid #2a2a2e;
}

.back-btn {
  background: none;
  border: none;
  color: #a09ab8;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
}

.back-btn:hover {
  background: #1e1e22;
  color: #e6e4ec;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.coming-soon {
  color: #4a4460;
  font-size: 16px;
}
</style>
