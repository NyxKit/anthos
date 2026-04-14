<script setup lang="ts">
import { onMounted } from 'vue'
import { NyxButton, NyxInput, NyxLogViewer, NyxSelect } from 'nyx-kit/components'
import { NyxInputType, NyxTheme } from 'nyx-kit/types'
import { useLogStore } from '@/logs/stores/logs'

const store = useLogStore()

onMounted(() => {
  void store.start()
})

const levelOptions = [
  { label: 'All', value: '' },
  { label: 'Debug', value: 'debug' },
  { label: 'Info', value: 'info' },
  { label: 'Warn', value: 'warn' },
  { label: 'Error', value: 'error' },
]
</script>

<template>
  <section class="logs-view">
    <section class="logs-view__filters">
      <NyxInput
        :type="NyxInputType.Date"
        :model-value="store.selectedDay ?? ''"
        placeholder="Day"
        @update:model-value="value => store.setDay(value || null)"
      />
      <NyxInput v-model="store.nodeId" :type="NyxInputType.Text" placeholder="Node ID" />
      <NyxInput v-model="store.source" :type="NyxInputType.Text" placeholder="Source" />
      <NyxSelect v-model="store.level" :options="levelOptions" placeholder="Severity" />
      <NyxInput v-model="store.query" class="logs-view__search" :type="NyxInputType.Search" placeholder="Search messages" />
      <div class="logs-view__actions">
        <NyxButton :theme="NyxTheme.Success" @click="store.applyFilters()">Apply</NyxButton>
        <NyxButton :theme="NyxTheme.Warning" @click="store.clearFilters()">Reset</NyxButton>
        <NyxButton v-if="store.hasMore" :theme="NyxTheme.Info" @click="store.loadOlder()">Load older</NyxButton>
      </div>
    </section>

    <p v-if="store.error" class="logs-view__error">{{ store.error }}</p>

    <div class="logs-view__body">
      <NyxLogViewer :model-value="store.entries" :theme="NyxTheme.Primary" timestamp-format="HH:mm:ss" />
    </div>
  </section>
</template>

<style scoped>
.logs-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logs-view__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.logs-view__eyebrow {
  font-family: var(--nyx-font-family-mono, monospace);
  color: var(--nyx-c-primary, #dcb8ff);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.logs-view h2 {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 2rem;
  margin: 0;
}

.logs-view__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.logs-view__filters {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--nyx-c-surface-container, #1b2026);
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.2));
}

.logs-view__search {
  grid-column: span 2;
}

.logs-view__actions {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.logs-view__error {
  color: #ff9b9b;
}

.logs-view__body {
  min-height: 420px;
}

@media (max-width: 1024px) {
  .logs-view__filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .logs-view__search {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .logs-view__header {
    flex-direction: column;
  }

  .logs-view__filters {
    grid-template-columns: 1fr;
  }

  .logs-view__search {
    grid-column: span 1;
  }
}
</style>
