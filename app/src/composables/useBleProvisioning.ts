import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import anthos from '@anthos/shared/anthos'

// tauri-plugin-blec exposes its JS API via Tauri invoke commands.
// The plugin registers these command names on the Rust side.
const scan = (serviceUuids: string[], timeoutMs: number) =>
  invoke<Array<{ name: string; address: string }>>('plugin:blec|scan', { serviceUuids, timeoutMs })
const connect = (address: string) =>
  invoke<void>('plugin:blec|connect', { address })
const disconnect = () =>
  invoke<void>('plugin:blec|disconnect')
const writeWithResponse = (serviceUuid: string, characteristicUuid: string, data: number[]) =>
  invoke<void>('plugin:blec|write_with_response', { serviceUuid, characteristicUuid, data })

export function createBleNotifySubscription(characteristicUuid: string, callback: (data: number[]) => void): () => void {
  const eventName = `blec:notify:${characteristicUuid}`
  const listener = (event: Event) => {
    callback((event as CustomEvent<number[]>).detail)
  }

  window.addEventListener(eventName, listener)

  return () => {
    window.removeEventListener(eventName, listener)
  }
}

const startNotify = async (serviceUuid: string, characteristicUuid: string, callback: (data: number[]) => void): Promise<() => void> => {
  await invoke<void>('plugin:blec|start_notify', { serviceUuid, characteristicUuid })
  return createBleNotifySubscription(characteristicUuid, callback)
}

export type ProvisionStatus = 'idle' | 'scanning' | 'connecting' | 'awaiting_credentials' | 'provisioning' | 'success' | 'failed'

export interface DiscoveredNode {
  name: string
  address: string
}

export interface ProvisionCredentials {
  ssid: string
  pass: string
  serverUrl?: string
}

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
const CREDS_CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'
const STATUS_CHAR_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'

export function useBleProvisioning() {
  const status = ref<ProvisionStatus>('idle')
  const discoveredNodes = ref<DiscoveredNode[]>([])
  const error = ref<string | null>(null)
  const connectedNode = ref<DiscoveredNode | null>(null)
  const wifiResult = ref<{ ip?: string; reason?: string } | null>(null)
  let stopStatusNotification: (() => void) | null = null

  async function openPairingWindow(): Promise<void> {
    try {
      await anthos.nodes.openProvisionWindow()
    } catch (err) {
      console.error('[useBleProvisioning] Failed to open pairing window:', err)
    }
  }

  async function scanForNodes(): Promise<void> {
    status.value = 'scanning'
    error.value = null
    discoveredNodes.value = []

    // Open pairing window before scan (T027)
    await openPairingWindow()

    try {
      const devices = await scan([SERVICE_UUID], 10000)
      discoveredNodes.value = devices
        .filter((d: { name: string; address: string }) => d.name?.startsWith('Anthos-'))
        .map((d: { name: string; address: string }) => ({ name: d.name, address: d.address }))
      status.value = 'idle'
    } catch (err) {
      status.value = 'failed'
      error.value = err instanceof Error ? err.message : 'BLE scan failed — ensure Bluetooth is enabled and permissions are granted.'
    }
  }

  async function connectToNode(node: DiscoveredNode): Promise<void> {
    status.value = 'connecting'
    error.value = null

    stopStatusNotification?.()
    stopStatusNotification = null

    try {
      await connect(node.address)
      connectedNode.value = node

      stopStatusNotification = await startNotify(SERVICE_UUID, STATUS_CHAR_UUID, (data: number[]) => {
        try {
          const text = new TextDecoder().decode(new Uint8Array(data))
          const payload = JSON.parse(text) as { status: string; ip?: string; reason?: string }

          if (payload.status === 'connecting') {
            status.value = 'provisioning'
          } else if (payload.status === 'success') {
            wifiResult.value = { ip: payload.ip }
            status.value = 'success'
            stopStatusNotification?.()
            stopStatusNotification = null
            disconnect().catch((e: unknown) => console.error('[useBleProvisioning] Disconnect error:', e))
          } else if (payload.status === 'failed') {
            wifiResult.value = { reason: payload.reason }
            status.value = 'failed'
            stopStatusNotification?.()
            stopStatusNotification = null
            disconnect().catch((e: unknown) => console.error('[useBleProvisioning] Disconnect error:', e))
          }
        } catch (parseErr) {
          console.error('[useBleProvisioning] Failed to parse status notification:', parseErr)
        }
      })

      status.value = 'awaiting_credentials'
    } catch (err) {
      status.value = 'failed'
      error.value = err instanceof Error ? err.message : 'Failed to connect to node — BLE may not be available on this platform.'
    }
  }

  async function sendCredentials(creds: ProvisionCredentials): Promise<void> {
    try {
      const bytes = Array.from(new TextEncoder().encode(JSON.stringify(creds)))
      await writeWithResponse(SERVICE_UUID, CREDS_CHAR_UUID, bytes)
    } catch (err) {
      status.value = 'failed'
      error.value = err instanceof Error ? err.message : 'Failed to send credentials.'
    }
  }

  function reset(): void {
    stopStatusNotification?.()
    stopStatusNotification = null
    status.value = 'idle'
    discoveredNodes.value = []
    error.value = null
    connectedNode.value = null
    wifiResult.value = null
  }

  return {
    status,
    discoveredNodes,
    error,
    connectedNode,
    wifiResult,
    scanForNodes,
    connectToNode,
    sendCredentials,
    reset,
    openPairingWindow,
  }
}
