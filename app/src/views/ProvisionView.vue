<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import anthos from '@anthos/shared/anthos'
import { useAuthStore } from '@/auth/stores/auth'
import { useBleProvisioning, type DiscoveredNode } from '@/composables/useBleProvisioning'

const router = useRouter()
const auth = useAuthStore()
const { status, discoveredNodes, error, connectedNode, wifiResult, scanForNodes, connectToNode, sendCredentials, reset } = useBleProvisioning()
const canPerformActions = computed(() => auth.canPerformActions)

// Credentials form
const ssid = ref('')
const pass = ref('')
const serverUrl = ref('')

// Provisioning timeout warning (T028)
const showTimeoutWarning = ref(false)
let provisioningTimer: ReturnType<typeof setTimeout> | null = null

watch(status, (newStatus) => {
  if (newStatus === 'provisioning') {
    provisioningTimer = setTimeout(() => {
      if (status.value === 'provisioning') {
        showTimeoutWarning.value = true
      }
    }, 30000)
  } else {
    if (provisioningTimer) {
      clearTimeout(provisioningTimer)
      provisioningTimer = null
    }
    showTimeoutWarning.value = false
  }
})

onMounted(async () => {
  if (!canPerformActions.value) return

  // T027: open pairing window at start of flow (non-blocking)
  try {
    await anthos.nodes.openProvisionWindow()
  } catch (err) {
    console.error('[ProvisionView] Failed to open pairing window on mount:', err)
  }
})

const isScanning = computed(() => status.value === 'scanning')
const hasNodes = computed(() => discoveredNodes.value.length > 0)

const showScanScreen = computed(() =>
  (status.value === 'idle' || status.value === 'scanning') && !hasNodes.value
)
const showSelectScreen = computed(() =>
  (status.value === 'idle' || status.value === 'connecting') && hasNodes.value
)
const showCredentialsScreen = computed(() => status.value === 'awaiting_credentials')
const showProgressScreen = computed(() =>
  status.value === 'provisioning' || status.value === 'success' || status.value === 'failed'
)

async function handleConnect(node: DiscoveredNode) {
  if (!canPerformActions.value) return
  await connectToNode(node)
}

async function handleSendCredentials() {
  if (!canPerformActions.value) return
  if (!ssid.value.trim()) return
  await sendCredentials({
    ssid: ssid.value,
    pass: pass.value,
    serverUrl: serverUrl.value || undefined,
  })
}

async function handleDisconnectAndReset() {
  reset()
  ssid.value = ''
  pass.value = ''
  serverUrl.value = ''
}

async function openPairingWindow() {
  if (!canPerformActions.value) return
  try {
    await anthos.nodes.openProvisionWindow()
  } catch (err) {
    console.error('[ProvisionView] Failed to open pairing window:', err)
  }
}

function handleDone() {
  router.push('/nodes')
}

function handleTryAgain() {
  handleDisconnectAndReset()
}
</script>

<template>
  <div class="provision-view">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="router.push('/')">&#8592;</button>
      <h1 class="header-title">
        <span v-if="showScanScreen || isScanning">Add a Node</span>
        <span v-else-if="showSelectScreen">Select Node</span>
        <span v-else-if="showCredentialsScreen">Enter WiFi Credentials</span>
        <span v-else-if="showProgressScreen && status === 'provisioning'">Connecting...</span>
        <span v-else-if="showProgressScreen && status === 'success'">Node Connected</span>
        <span v-else-if="showProgressScreen && status === 'failed'">Connection Failed</span>
      </h1>
    </div>

    <div class="content">

      <!-- Screen 1: Scan -->
      <div v-if="showScanScreen" class="screen">
        <p class="subtitle">Scan for nearby Anthos nodes</p>
        <button
          class="btn btn-primary"
          :disabled="isScanning || !canPerformActions"
          @click="scanForNodes()"
        >
          <span v-if="isScanning" class="spinner-inline"></span>
          <span>{{ isScanning ? 'Scanning...' : 'Scan' }}</span>
        </button>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>

      <!-- Screen 2: Select Node -->
      <div v-else-if="showSelectScreen" class="screen">
        <p class="subtitle">Tap a node to connect</p>
        <ul class="node-list">
          <li
            v-for="node in discoveredNodes"
            :key="node.address"
            class="node-item"
            :class="{ 'node-item--loading': status === 'connecting' && connectedNode?.address === node.address }"
            @click="canPerformActions && handleConnect(node)"
          >
            <div class="node-info">
              <span class="node-name">{{ node.name }}</span>
              <span class="node-address">{{ node.address }}</span>
            </div>
            <span v-if="status === 'connecting' && connectedNode?.address === node.address" class="spinner-inline"></span>
            <span v-else class="chevron">›</span>
          </li>
        </ul>
        <button class="btn btn-secondary" :disabled="!canPerformActions" @click="scanForNodes()">Re-scan</button>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>

      <!-- Screen 3: Credentials -->
      <div v-else-if="showCredentialsScreen" class="screen">
        <p class="subtitle">
          Credentials for <strong>{{ connectedNode?.name }}</strong>
        </p>
        <form class="form" @submit.prevent="handleSendCredentials()">
          <div class="form-field">
            <label for="ssid">WiFi Network (SSID)</label>
            <input
              id="ssid"
              v-model="ssid"
              type="text"
              placeholder="Network name"
              required
              autocomplete="off"
            />
          </div>
          <div class="form-field">
            <label for="pass">Password</label>
            <input
              id="pass"
              v-model="pass"
              type="password"
              placeholder="WiFi password"
              autocomplete="off"
            />
          </div>
          <div class="form-field">
            <label for="serverUrl">Hub URL <span class="optional">(optional)</span></label>
            <input
              id="serverUrl"
              v-model="serverUrl"
              type="text"
              placeholder="Leave blank for auto-discovery"
              autocomplete="off"
            />
          </div>
          <button type="submit" class="btn btn-primary" :disabled="!ssid.trim() || !canPerformActions">
            Connect
          </button>
        </form>
        <button class="btn btn-ghost" @click="handleDisconnectAndReset()">Back</button>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>

      <!-- Screen 4: Progress / Done / Failed -->
      <div v-else-if="showProgressScreen" class="screen screen--center">

        <!-- Provisioning -->
        <template v-if="status === 'provisioning'">
          <div class="spinner-large"></div>
          <p class="progress-label">Connecting to WiFi...</p>
          <div v-if="showTimeoutWarning" class="timeout-warning">
            <p class="warning-text">This is taking longer than expected. The hub may not have a pairing window open.</p>
            <button class="btn btn-secondary" :disabled="!canPerformActions" @click="openPairingWindow()">Open pairing window</button>
          </div>
        </template>

        <!-- Success -->
        <template v-else-if="status === 'success'">
          <div class="icon icon--success">&#10003;</div>
          <p class="progress-label">Node connected!</p>
          <p v-if="wifiResult?.ip" class="progress-detail">IP: {{ wifiResult.ip }}</p>
          <button class="btn btn-primary" @click="handleDone()">Done</button>
        </template>

        <!-- Failed -->
        <template v-else-if="status === 'failed'">
          <div class="icon icon--error">&#10007;</div>
          <p class="progress-label">Connection failed</p>
          <p v-if="wifiResult?.reason" class="progress-detail error-text">{{ wifiResult.reason }}</p>
          <p v-else-if="error" class="progress-detail error-text">{{ error }}</p>
          <button class="btn btn-primary" @click="handleTryAgain()">Try again</button>
        </template>

      </div>

    </div>
  </div>
</template>

<style scoped>
.provision-view {
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
  color: #e6e4ec;
}

.content {
  flex: 1;
  padding: 24px 16px;
}

.screen {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  margin: 0 auto;
}

.screen--center {
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.subtitle {
  color: #a09ab8;
  font-size: 14px;
}

/* Buttons */
.btn {
  padding: 12px 20px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #7c6af7;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #6a58e0;
}

.btn-secondary {
  background: #1e1e22;
  color: #a09ab8;
  border: 1px solid #2a2a2e;
}

.btn-secondary:hover {
  background: #2a2a30;
  color: #e6e4ec;
}

.btn-ghost {
  background: none;
  color: #a09ab8;
  font-weight: 400;
}

.btn-ghost:hover {
  color: #e6e4ec;
}

/* Node list */
.node-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #1a1a1e;
  border: 1px solid #2a2a2e;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.node-item:hover {
  background: #222226;
}

.node-item--loading {
  opacity: 0.7;
  cursor: wait;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-name {
  font-size: 15px;
  font-weight: 600;
  color: #e6e4ec;
}

.node-address {
  font-size: 12px;
  color: #6b6580;
  font-family: monospace;
}

.chevron {
  color: #4a4460;
  font-size: 20px;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: #a09ab8;
}

.optional {
  font-weight: 400;
  color: #6b6580;
}

.form-field input {
  padding: 12px 14px;
  background: #1a1a1e;
  border: 1px solid #2a2a2e;
  border-radius: 8px;
  color: #e6e4ec;
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;
}

.form-field input:focus {
  border-color: #7c6af7;
}

.form-field input::placeholder {
  color: #4a4460;
}

/* Progress */
.progress-label {
  font-size: 18px;
  font-weight: 600;
  color: #e6e4ec;
  margin-top: 16px;
}

.progress-detail {
  font-size: 14px;
  color: #a09ab8;
}

.error-text {
  color: #f07070;
}

/* Icons */
.icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
}

.icon--success {
  background: rgba(72, 187, 120, 0.15);
  color: #48bb78;
}

.icon--error {
  background: rgba(240, 112, 112, 0.15);
  color: #f07070;
}

/* Spinners */
.spinner-large {
  width: 52px;
  height: 52px;
  border: 4px solid #2a2a2e;
  border-top-color: #7c6af7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-inline {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error message */
.error-msg {
  font-size: 13px;
  color: #f07070;
  background: rgba(240, 112, 112, 0.08);
  border: 1px solid rgba(240, 112, 112, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
}

/* Timeout warning */
.timeout-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: rgba(240, 180, 80, 0.08);
  border: 1px solid rgba(240, 180, 80, 0.2);
  border-radius: 10px;
  max-width: 340px;
}

.warning-text {
  font-size: 13px;
  color: #f0b450;
  text-align: center;
}
</style>
