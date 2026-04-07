<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="home-view">
    <div class="hero">
      <h1 class="title">Anthos</h1>
      <p class="subtitle">Plant monitoring system</p>
    </div>
    <div class="actions">
      <button class="btn btn-primary" @click="router.push('/provision')">
        Add Node
      </button>
      <button class="btn btn-secondary" @click="router.push('/nodes')">
        Nodes
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  padding: 24px;
  background: #0e0e10;
  color: #e6e4ec;
}

.hero {
  text-align: center;
}

.title {
  font-size: 42px;
  font-weight: 700;
  color: #e6e4ec;
  letter-spacing: -1px;
}

.subtitle {
  margin-top: 8px;
  font-size: 16px;
  color: #6b6580;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 280px;
}

.btn {
  padding: 14px 20px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: opacity 0.15s;
}

.btn-primary {
  background: #7c6af7;
  color: #fff;
}

.btn-primary:hover {
  background: #6a58e0;
}

.btn-secondary {
  background: #1a1a1e;
  color: #a09ab8;
  border: 1px solid #2a2a2e;
}

.btn-secondary:hover {
  background: #222226;
  color: #e6e4ec;
}
</style>
