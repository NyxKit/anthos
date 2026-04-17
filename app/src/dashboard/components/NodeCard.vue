<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { NyxCard, NyxIcon, NyxActionItem, NyxBadge, NyxInput, NyxButton, NyxDropdown, NyxStatusDot } from 'nyx-kit/components'
import { NyxInputNumberControls, NyxInputType, NyxSize, NyxTheme, NyxVariant, NyxSelectOption, NyxShape } from 'nyx-kit/types'
import anthos from '@anthos/shared/anthos'
import { useTelemetryStore } from '@/dashboard/stores/telemetry'
import { useLogStore } from '@/logs/stores/logs'
import { logo } from '@/shared/assets'
import { PowerProfile, POWER_PROFILES } from '@anthos/shared/power-profiles'
import type { LogicalNodeRecord, NodePowerProfileState } from '@anthos/shared'

const powerProfileSelectOptions: NyxSelectOption[] = Object.values(POWER_PROFILES).map(profile => ({
  label: profile.label,
  value: profile.profileId,
  icon: profile.icon
}))

const PUMP_VOLUME_ML = 100

const props = defineProps<{
  node?: LogicalNodeRecord
}>()

const store = useTelemetryStore()
const logStore = useLogStore()
const pumpState = ref<'idle' | 'loading' | 'error'>('idle')
const pumpError = ref<string | null>(null)
const pumpVolumeMl = ref(String(PUMP_VOLUME_ML))
const pendingPumpCommandId = ref<string | null>(null)
const profileState = ref<NodePowerProfileState | null>(null)
const profileStateLoading = ref(false)
const profileError = ref<string | null>(null)
const selectedProfileId = ref(PowerProfile.Performance)

const nodeDisplayName = computed(() => {
  return props.node?.displayName || props.node?.nodeId || store.nodeId || 'Unknown Node'
})

const capability = computed(() => props.node?.capability ?? store.node?.capability)
const capabilityLabel = computed(() => capability.value === 'watering' ? 'Watering' : 'Earth')
const actionNodeId = computed(() => props.node?.nodeId || store.nodeId || '')
const isLiveNode = computed(() => Boolean(actionNodeId.value) && actionNodeId.value === store.nodeId && store.status === 'connected')
const connectionLabel = computed(() => isLiveNode.value ? 'Online' : 'Offline')

const getProfileIcon = (profileId?: PowerProfile | null) => {
  if (!profileId) return 'question-mark'
  return POWER_PROFILES[profileId]?.icon ?? 'question-mark'
}

const getPowerProfileLabel = (profileId?: PowerProfile | null) => {
  if (!profileId) return 'No profile'
  return POWER_PROFILES[profileId]?.label ?? profileId
}

const getSensorValue = (type: string) => {
  if (!isLiveNode.value) return '--'
  const sensor = store.sensors.find(s => s.type === type)
  return sensor ? sensor.value.toFixed(1) : '--'
}

const getSensorUnit = (type: string) => {
  if (!isLiveNode.value) return ''
  const sensor = store.sensors.find(s => s.type === type)
  return sensor?.unit || ''
}

const isCritical = computed(() => {
  if (!isLiveNode.value) return false
  const moisture = store.sensors.find(s => s.type === 'moisture')
  return moisture && moisture.value < 20
})

const pumpButtonLabel = computed(() => {
  if (pumpState.value === 'loading' || isPumpPending.value) return 'Pumping...'
  return 'Pump'
})

const isPumpPending = computed(() => {
  return Boolean(pendingPumpCommandId.value) && !hasTerminalPumpLog.value
})

const hasTerminalPumpLog = computed(() => {
  if (!pendingPumpCommandId.value || !actionNodeId.value) return false

  return logStore.entries.some(entry => {
    const meta = entry.meta as { commandId?: string } | undefined
    return meta?.commandId === pendingPumpCommandId.value
      && (entry.message.includes('completed') || entry.message.includes('failed') || entry.message.includes('rejected'))
  })
})

const isPumpButtonDisabled = computed(() => {
  return pumpState.value === 'loading' || isPumpPending.value
})

const formattedTimestamp = computed(() => {
  if (!isLiveNode.value) return 'offline'

  const now = Date.now()
  const ts = store.timestampMs ?? 0

  const diff = now - ts
  const seconds = Math.floor(diff / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
})

const formattedUptime = computed(() => {
  if (!isLiveNode.value) return '-'
  if (!store.health?.uptimeMs) return '-'
  const hours = Math.floor(store.health.uptimeMs / 3600000)
  const mins = Math.floor((store.health.uptimeMs % 3600000) / 60000)
  return `${hours}h ${mins}m`
})

watch(hasTerminalPumpLog, done => {
  if (done && pendingPumpCommandId.value) {
    pendingPumpCommandId.value = null
    pumpState.value = 'idle'
  }
})

watch(actionNodeId, () => {
  void loadPowerProfile()
})

onMounted(() => {
  void logStore.start()
  void loadPowerProfile()
})

async function loadPowerProfile() {
  if (!actionNodeId.value) return

  profileStateLoading.value = true
  profileError.value = null

  try {
    const state = await anthos.nodes.getPowerProfile(actionNodeId.value)
    profileState.value = state
    selectedProfileId.value = state.assignment?.profileId ?? state.applied?.profileId ?? PowerProfile.Balanced
  } catch (error) {
    profileState.value = null
    profileError.value = error instanceof Error ? error.message : 'Failed to load power profile'
  } finally {
    profileStateLoading.value = false
  }
}

async function handlePowerProfileApply() {
  if (!actionNodeId.value) return

  profileStateLoading.value = true
  profileError.value = null

  try {
    const state = await anthos.nodes.applyPowerProfile(actionNodeId.value, selectedProfileId.value)
    profileState.value = state
    selectedProfileId.value = state.assignment?.profileId ?? selectedProfileId.value
  } catch (error) {
    profileError.value = error instanceof Error ? error.message : 'Failed to apply power profile'
  } finally {
    profileStateLoading.value = false
  }
}

async function handlePowerProfileSelect(option: NyxSelectOption) {
  selectedProfileId.value = option.value as PowerProfile
  await handlePowerProfileApply()
}

async function handlePumpClick() {
  if (!actionNodeId.value) return

  pumpState.value = 'loading'
  pumpError.value = null

  try {
    const response = await anthos.nodes.queuePump(actionNodeId.value, Number(pumpVolumeMl.value))
    pendingPumpCommandId.value = response.commandId
    pumpState.value = 'idle'
  } catch (error) {
    pumpState.value = 'error'
    pumpError.value = error instanceof Error ? error.message : 'Failed to queue pump command'
  }
}
</script>

<template>
  <NyxCard class="node-card" :class="{ 'node-card--critical': isCritical }" :variant="NyxVariant.Text">
    <!-- Header -->
    <template #header>
      <div class="node-card__header">
        <div class="node-card__header-left">
          <div class="node-card__icon">
            <img :src="logo" alt="Node" />
          </div>
          <div>
            <h3>{{ nodeDisplayName }}</h3>
            <div class="node-card__meta">
              <NyxStatusDot
                class="node-card__status-dot"
                :theme="isLiveNode ? NyxTheme.Success : NyxTheme.Danger"
                :size="NyxSize.Small"
                :label="connectionLabel"
              />
            </div>
          </div>
        </div>
        <div class="node-card__header-right" v-if="props.node">
          <NyxDropdown 
            v-if="capability === 'watering'"
            :theme="NyxTheme.Secondary"
            :size="NyxSize.Small"
          >
            <NyxButton :theme="NyxTheme.Secondary" :variant="NyxVariant.Subtle" :size="NyxSize.Small" :shape="NyxShape.Square" :disabled="!isLiveNode">
              <NyxSpinner v-if="pumpState === 'loading'" :theme="NyxTheme.Secondary" :size="NyxSize.Small" />
              <NyxIcon v-else name="soap-dispenser-droplet" :size="NyxSize.Small" />
            </NyxButton>
            <template #dropdown>
              <NyxActionItem
                class="node-card__pump-action"
                title="Pump"
                :theme="NyxTheme.Secondary"
                :action="pumpState === 'loading' ? 'Pumping...' : 'Pump'"
                @click="handlePumpClick"
              >
                <span class="node-card__pump-status" :data-state="pumpState">
                  {{ isPumpPending ? 'Command queued' : pumpState === 'error' ? pumpError || 'Failed to queue pump command' : 'Test the pump flow' }}
                </span>
                <template #action>
                  <NyxInput
                    class="node-card__pump-volume"
                    :type="NyxInputType.Number"
                    :theme="NyxTheme.Secondary"
                    :size="NyxSize.Small"
                    :min="10"
                    :max="500"
                    :step="10"
                    :number-controls="NyxInputNumberControls.None"
                    v-model="pumpVolumeMl"
                    suffix="ml"
                  />
                  <NyxButton
                    :theme="NyxTheme.Secondary"
                    :size="NyxSize.Small"
                    :disabled="isPumpButtonDisabled"
                    :loading="pumpState === 'loading'"
                    @click="handlePumpClick"
                  >
                    <NyxIcon name="soap-dispenser-droplet" :size="NyxSize.Small" /> {{ pumpButtonLabel }}
                  </NyxButton>
                </template>
              </NyxActionItem>
            </template>
          </NyxDropdown>
          <NyxDropdown
            :theme="NyxTheme.Primary"
            :size="NyxSize.Small"
            :options="powerProfileSelectOptions"
            @select="handlePowerProfileSelect"
          >
            <NyxButton :theme="NyxTheme.Primary" :variant="NyxVariant.Subtle" :size="NyxSize.Small" :shape="NyxShape.Square" :disabled="!isLiveNode">
              <NyxIcon :name="getProfileIcon(selectedProfileId)" :size="NyxSize.Small" />
            </NyxButton>
          </NyxDropdown>
        </div>
      </div>
    </template>

    <!-- Sensor Grid -->
    <div class="node-card__sensors">
      <div class="node-card__sensor">
          <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">LIGHT</span>
          <NyxIcon name="sun" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value">{{ getSensorValue('lux') }} <span>{{ getSensorUnit('lux') }}</span></p>
      </div>
      <div class="node-card__sensor">
        <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">TEMPERATURE</span>
          <NyxIcon name="thermometer" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value">{{ getSensorValue('temperature') }} <span>{{ getSensorUnit('temperature') }}</span></p>
      </div>
      <div class="node-card__sensor">
        <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">HUMIDITY</span>
          <NyxIcon name="bubbles" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value">{{ getSensorValue('humidity') }} <span>{{ getSensorUnit('humidity') }}</span></p>
      </div>
      <div class="node-card__sensor" :class="{ 'node-card__sensor--critical': isCritical }">
        <div class="node-card__sensor-header">
          <span class="node-card__sensor-label">SOIL MOISTURE</span>
          <NyxIcon name="droplets" :size="NyxSize.Small" class="node-card__sensor-icon" />
        </div>
        <p class="node-card__sensor-value" :class="{ 'node-card__sensor-value--critical': isCritical }">
          {{ getSensorValue('moisture') }} <span>{{ getSensorUnit('moisture') }}</span>
        </p>
      </div>
    </div>

    <!-- Metadata Footer -->
    <div class="node-card__footer">
      <div class="node-card__footer-row">
        <span>PRESSURE</span>
        <span>1013.25 PA</span>
      </div>
      <div class="node-card__footer-row">
        <span>IP ADDRESS</span>
        <span>{{ store.health?.ip || '192.168.1.x' }}</span>
      </div>
      <div class="node-card__footer-row">
        <span>NODE ID</span>
        <span>{{ props.node?.nodeId || '--' }}</span>
      </div>
      <div class="node-card__footer-row">
        <span>HARDWARE ID</span>
        <span>{{ props.node?.hwId || '--' }}</span>
      </div>
      <div class="node-card__footer-row">
        <span>POWER PROFILE</span>
        <span>{{ getPowerProfileLabel(selectedProfileId) }}</span>
      </div>
      <div class="node-card__footer-row">
        <span>UPTIME</span>
        <span>{{ formattedUptime }}</span>
      </div>
      <div class="node-card__footer-bottom">
        <div class="node-card__rssi">
          <NyxIcon name="wifi" :size="NyxSize.Small" />
          <span>RSSI: {{ store.health?.rssi || '--' }}dBm</span>
        </div>
        <span class="node-card__updated">Updated {{ formattedTimestamp }}</span>
      </div>
    </div>
  </NyxCard>
</template>

<style scoped>
.node-card {
  background: var(--nyx-c-surface-container-low, #171c22);
  border: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
  border-radius: 0.75rem;
  overflow: hidden;
  transition: border-color 0.3s ease;
  padding: 0;
}

.node-card:hover {
  border-color: var(--nyx-c-primary, rgba(220, 184, 255, 0.3));
}

.node-card--critical {
  border-color: var(--nyx-c-error, rgba(255, 180, 171, 0.3));
}

.node-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__header-left {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.node-card__icon {
  width: 3rem;
  height: 3rem;
  background: var(--nyx-c-surface-container-high, #252a30);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--nyx-c-primary, rgba(220, 184, 255, 0.1));
  overflow: hidden;
}

.node-card__icon img {
  width: 2rem;
  height: 2rem;
  opacity: 0.8;
}

.node-card__header h3 {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--nyx-c-on-surface, #dee3eb);
  margin: 0;
  letter-spacing: -0.025em;
}

.node-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.node-card__status-dot {
  text-transform: uppercase;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-info);
  letter-spacing: 0.1em;
  font-weight: 700;
}

.node-card__status-dot.theme-success {
  color: var(--nyx-c-success);
}

.node-card__capability {
  padding: 0.125rem 0.4rem;
  border-radius: 999px;
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--nyx-c-text-1, #dee3eb);
  background: rgba(109, 109, 240, 0.12);
  border: 1px solid rgba(109, 109, 240, 0.25);
}

.node-card__pump-unit {
  font-size: 0.75rem;
  color: var(--nyx-c-on-surface-variant, #cfc2d6);
  margin-inline: 0.25rem 0.5rem;
}

.node-card__status-text {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.8));
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.node-card__header-right {
  text-align: right;
}

.node-card__location {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
  margin: 0;
}

.node-card__id {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
  margin: 0.25rem 0 0 0;
}

/* Sensor Grid */
.node-card__sensors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__sensor {
  background: var(--nyx-c-surface-container-low, #171c22);
  padding: 1rem;
}

.node-card__sensor--critical {
  background: rgba(255, 180, 171, 0.05);
}

.node-card__sensor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.node-card__sensor-label {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.5));
  letter-spacing: 0.1em;
}

.node-card__sensor-icon {
  font-size: 0.75rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.3));
}

.node-card__sensor-value {
  font-family: var(--nyx-font-family-headline, 'Space Grotesk', sans-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--nyx-c-on-surface, #dee3eb);
  margin: 0;
}

.node-card__sensor-value span {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.75rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
}

.node-card__sensor-value--critical {
  color: var(--nyx-c-error, #ffb4ab);
}

.node-card__profile {
  padding: 1rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
  background: linear-gradient(180deg, rgba(109, 109, 240, 0.05), transparent);
}

.node-card__profile-header,
.node-card__profile-controls,
.node-card__profile-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.node-card__profile-header {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
  margin-bottom: 0.75rem;
}

.node-card__profile-dropdown {
  min-width: 14rem;
  flex: 1;
}

/* Footer */
.node-card__footer {
  padding: 1rem;
  background: var(--nyx-c-surface-container-lowest, #0a0f14);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-card__footer-row {
  display: flex;
  justify-content: space-between;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
}

.node-card__footer-row span:first-child {
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.4));
}

.node-card__footer-row span:last-child {
  color: var(--nyx-c-on-surface, #dee3eb);
}

.node-card__footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.node-card__pump-button {
  min-width: 5rem;
}

.node-card__pump-status {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.45));
}

.node-card__pump-status[data-state='done'] {
  color: var(--nyx-c-tertiary, #60de87);
}

.node-card__pump-status[data-state='error'] {
  color: var(--nyx-c-error, #ffb4ab);
}

.node-card__rssi {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.55));
}

.node-card__updated {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.5625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.3));
  font-style: italic;
  text-transform: uppercase;
}

.node-card__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid var(--nyx-c-outline-variant, rgba(76, 67, 84, 0.1));
}

.node-card__pump-status {
  font-family: var(--nyx-font-family-mono, monospace);
  font-size: 0.625rem;
  color: var(--nyx-c-text-3, rgba(171, 170, 177, 0.45));
}

.node-card__pump-status[data-state='done'] {
  color: var(--nyx-c-tertiary, #60de87);
}

.node-card__pump-status[data-state='error'] {
  color: var(--nyx-c-error, #ffb4ab);
}

.node-card__pump-duration {
  width: 5rem;
  text-align: center;
}

.node-card__pump-action {
  min-width: min(25rem, 95dvw);
}
</style>
