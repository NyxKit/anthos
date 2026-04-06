# Contract: BLE GATT Provisioning Service

**Owner**: Node firmware (`node/`)  
**Consumer**: Mobile app (`app/`) via `tauri-plugin-blec`

---

## Overview

An unprovisioned node (no WiFi credentials in NVS) advertises a custom BLE GATT service. The mobile app discovers the node by its advertisement name, connects, writes WiFi credentials, and receives a status notification. The BLE session closes after the terminal status is sent.

---

## Advertisement

| Property | Value |
|---|---|
| Advertisement name | `Anthos-XXXX` where XXXX = last 4 chars of `hw_id` (e.g., `Anthos-EEFF`) |
| Advertised service UUID | `4fafc201-1fb5-459e-8fcc-c5c9c331914b` |

The app filters BLE scan results by devices whose name starts with `"Anthos-"` and advertise the provisioning service UUID. This allows the app to distinguish Anthos nodes from other BLE devices.

---

## GATT Service

**Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`

### Characteristic 1 — Credentials (Write)

| Property | Value |
|---|---|
| UUID | `beb5483e-36e1-4688-b7f5-ea07361b26a8` |
| Properties | WRITE (with response) |
| Max length | 512 bytes |

**Payload written by app** (JSON string, UTF-8 encoded):
```json
{
  "ssid": "MyNetwork",
  "pass": "secret123",
  "serverUrl": "http://192.168.1.10:3000"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `ssid` | string | yes | WiFi network name |
| `pass` | string | yes | WiFi password |
| `serverUrl` | string | no | Hub base URL. If absent, node uses mDNS discovery (`anthos.local`) |

**Node behavior on write:**
1. Parse JSON payload
2. Store `ssid` + `pass` in NVS (`wifi_ssid`, `wifi_pass`)
3. Store `serverUrl` in NVS (`server_url`) if provided
4. Begin WiFi connection attempt
5. Notify status updates via Characteristic 2

---

### Characteristic 2 — Status (Notify)

| Property | Value |
|---|---|
| UUID | `6e400003-b5a3-f393-e0a9-e50e24dcca9e` |
| Properties | NOTIFY |

**Payloads notified by node** (JSON string, UTF-8 encoded):

*Connecting:*
```json
{ "status": "connecting" }
```

*Success:*
```json
{ "status": "success", "ip": "192.168.1.42" }
```

*Failure:*
```json
{ "status": "failed", "reason": "wrong_password" | "timeout" | "network_not_found" }
```

| `status` | Terminal? | Notes |
|---|---|---|
| `connecting` | No | Sent immediately after writing credentials |
| `success` | Yes | Node has joined WiFi; BLE session closes after this |
| `failed` | Yes | WiFi join failed; BLE session closes after this |

**App behavior on terminal status:**
- On `success`: disconnect from BLE, begin polling `GET /api/provision/status` for node appearance
- On `failed`: display error to user, offer retry (re-write credentials)

---

## Session Lifecycle

```
App                             Node
 │                               │
 │── scan ──────────────────────▶│ (advertising "Anthos-EEFF")
 │◀─ discovered ─────────────────│
 │                               │
 │── connect ────────────────────▶│
 │── subscribe to Status ────────▶│
 │── write Credentials ──────────▶│
 │                               │── WiFi connect attempt
 │◀─ notify: "connecting" ───────│
 │                               │── (30s timeout)
 │◀─ notify: "success" ──────────│
 │── disconnect ─────────────────▶│
 │                               │── close BLE, begin mDNS, POST /register
```

---

## Error Handling

| Scenario | Node behavior | App behavior |
|---|---|---|
| Invalid JSON written to Credentials | Ignore write, no notification | App should validate before writing |
| WiFi connect timeout (30s) | Notify `failed` + `reason: "timeout"`, close BLE | Show error, offer retry |
| Wrong password | Notify `failed` + `reason: "wrong_password"`, close BLE | Show error, offer retry |
| App disconnects before writing | Node waits up to provisioning timeout, then falls back to AP mode | — |
