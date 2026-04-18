<script setup lang="ts">
import { onMounted } from 'vue'
import { NyxLogViewer, NyxBadge } from 'nyx-kit/components'
import { useLogStore } from '@/logs/stores/logs'

const store = useLogStore()

onMounted(() => {
  void store.start()
})
</script>

<template>
  <div class="activity-log">
    <div class="activity-log__header">
      <div>
        <h4>Anthos Log Preview</h4>
      </div>
      <div class="activity-log__badges">
        <NyxBadge>{{ store.isLive ? 'LIVE' : 'HISTORICAL' }}</NyxBadge>
        <NyxBadge>{{ store.visibleCount }} ENTRIES</NyxBadge>
      </div>
    </div>
    <NyxLogViewer
      class="activity-log__log-viewer"
      :model-value="store.entries.slice(0, 8)"
      timestamp-format="HH:mm:ss"
    />
  </div>
</template>

<style scoped>
.activity-log {
  background: var(--nyx-c-surface-container, #1b2026);
  border-radius: 0.75rem;
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
  padding: 1.5rem;
}

.activity-log__log-viewer {
  margin: -0.5rem;
}

.activity-log__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.activity-log__header h4 {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--nyx-c-primary, #dcb8ff);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0;
}

.activity-log__summary {
  margin-top: 0.35rem;
  color: var(--nyx-c-on-surface-variant, #cfc2d6);
  font-size: 0.875rem;
}

.activity-log__badges {
  display: flex;
  gap: 0.5rem;
}

.activity-log__link {
  display: inline-flex;
  margin-top: 1rem;
  color: var(--nyx-c-primary, #dcb8ff);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.activity-log__badge {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  padding: 0.25rem 0.75rem;
  background: var(--nyx-c-surface-container-high, #252a30);
  border-radius: 9999px;
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
  color: var(--nyx-c-on-surface, #dee3eb);
}
</style>
