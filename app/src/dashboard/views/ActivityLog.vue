<script setup lang="ts">
import { ref } from 'vue'
import { NyxLogViewer } from 'nyx-kit/components'
import { NyxTheme } from 'nyx-kit/types'

interface NyxLogEntry {
  timestamp: string
  origin: string
  value: string
  theme?: NyxTheme
}

const events = ref<NyxLogEntry[]>([
  { timestamp: '14:02:44', origin: 'NODE_0xFF-4412', value: 'Environmental recalibration successful. Sensor drift < 0.02%', theme: NyxTheme.Success },
  { timestamp: '14:01:12', origin: 'SYS_ALERT', value: 'Node [Monstera-1] reporting sub-optimal soil moisture (12%). Automation triggered.', theme: NyxTheme.Warning },
  { timestamp: '13:58:22', origin: 'NODE_0xAB-1109', value: 'Heartbeat received. Signal strength stabilized at -58dBm.', theme: NyxTheme.Success },
  { timestamp: '13:55:04', origin: 'SYS_CORE', value: 'Main gateway ping 24ms. Anthos laboratory mesh secure.', theme: NyxTheme.Success },
])
</script>

<template>
  <div class="activity-log">
    <div class="activity-log__header">
      <h4>Anthos Biometric Sync</h4>
      <div class="activity-log__badges">
        <span class="activity-log__badge">REAL-TIME</span>
        <span class="activity-log__badge">LOGGING</span>
      </div>
    </div>
    <NyxLogViewer v-model="events" timestampFormat="HH:mm:ss" />
  </div>
</template>

<style scoped>
.activity-log {
  background: var(--nyx-c-surface-container, #1b2026);
  border-radius: 0.75rem;
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
  padding: 1.5rem;
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

.activity-log__badges {
  display: flex;
  gap: 0.5rem;
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