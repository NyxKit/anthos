# Research: Generic Node Provisioning

**Branch**: `002-generic-node-provisioning` | **Date**: 2026-04-06

## Firmware BLE Library

**Decision:** NimBLE-Arduino (`h2zero/NimBLE-Arduino`)

**Rationale:** ~170KB less flash and ~100KB less RAM than the default Bluedroid stack. Reconnection after deep sleep is 3× faster. A simple two-characteristic GATT service (write + notify) doesn't need any of Bluedroid's classic Bluetooth features. NimBLE is the correct choice for constrained embedded devices.

**PlatformIO lib_deps entry:**
```
h2zero/NimBLE-Arduino@^1.4.0
```

**Alternatives considered:** ESP32 BLE Arduino (Bluedroid) — rejected due to excessive RAM/flash overhead.

---

## Hardware Unique Identifier

**Decision:** `ESP.getEfuseMac()` → formatted as 12-character uppercase hex string (e.g., `"AABBCCDDEEFF"`)

**Rationale:** `ESP.getEfuseMac()` returns a `uint64_t` containing the 48-bit factory-burned MAC address. It is stable across reboots and factory resets. Converting to a 12-char hex string gives a clean, human-inspectable identifier. The last 4 characters are used as the BLE advertisement suffix (e.g., `"Anthos-EEFF"`).

**Code pattern:**
```cpp
String getHwId() {
  uint64_t mac = ESP.getEfuseMac();
  char buf[13];
  snprintf(buf, sizeof(buf), "%02X%02X%02X%02X%02X%02X",
    (uint8_t)(mac >> 40), (uint8_t)(mac >> 32), (uint8_t)(mac >> 24),
    (uint8_t)(mac >> 16), (uint8_t)(mac >> 8),  (uint8_t)(mac));
  return String(buf);
}

String getAdvertisementName() {
  String hw = getHwId();
  return "Anthos-" + hw.substring(8); // Last 4 chars
}
```

**Alternatives considered:** `esp_efuse_mac_get_default()` — valid, but requires IDF headers and is less idiomatic in Arduino framework.

---

## Non-Volatile Storage

**Decision:** Arduino `Preferences` library, namespace `"anthos"`

**Rationale:** Built-in to the ESP32 Arduino board package. Wraps the ESP-IDF NVS partition. Key-value storage survives reboots. The namespace is cleared on factory reset via `prefs.clear()`.

**Key names:**
| Key | Type | Meaning |
|---|---|---|
| `wifi_ssid` | String | WiFi network name |
| `wifi_pass` | String | WiFi password |
| `server_url` | String | Hub base URL (e.g., `http://anthos.local:3000`) |
| `node_id` | String | Assigned logical node ID from hub |

**First-boot detection:** Check if `wifi_ssid` key exists. If absent → no credentials → provisioning mode.

**Factory reset:**
```cpp
Preferences prefs;
prefs.begin("anthos", false);
prefs.clear();
prefs.end();
ESP.restart();
```

---

## mDNS Client (Hub Discovery)

**Decision:** `ESPmDNS` — built into the ESP32 Arduino board package, no additional lib_deps required.

**Rationale:** `MDNS.queryHost("anthos", 5000)` resolves `anthos.local` with a 5-second timeout and returns an `IPAddress`. If resolution succeeds, the node constructs the server URL as `http://<ip>:3000`. If it fails, the node retries at a configurable interval.

**Code pattern:**
```cpp
#include <ESPmDNS.h>

String resolveHub() {
  IPAddress ip = MDNS.queryHost("anthos", 5000);
  if (ip == (uint32_t)0) return "";
  return "http://" + ip.toString() + ":3000";
}
```

**Alternatives considered:** Hardcoded IP — rejected as it defeats zero-config provisioning. DNS-SD service query — unnecessary complexity for a single known host.

---

## BLE GATT Service Design

**Decision:** Custom GATT service with two characteristics.

| Item | Value |
|---|---|
| Service UUID | `4fafc201-1fb5-459e-8fcc-c5c9c331914b` |
| Credentials Characteristic UUID | `beb5483e-36e1-4688-b7f5-ea07361b26a8` |
| Status Characteristic UUID | `6e400003-b5a3-f393-e0a9-e50e24dcca9e` |
| Credentials property | WRITE (no response) |
| Status property | NOTIFY |

**Credentials payload** (written by app to node): JSON string
```json
{"ssid": "MyNetwork", "pass": "secret123", "serverUrl": "http://192.168.1.10:3000"}
```
`serverUrl` is optional; if absent the node uses mDNS discovery.

**Status payload** (notified from node to app): JSON string
```json
{"status": "connecting" | "success" | "failed", "ip": "192.168.1.42"}
```

**Session lifecycle:** BLE session closes after the node sends a `success` or `failed` status notification. The app disconnects cleanly after receiving a terminal status.

---

## Tauri BLE Plugin

**Decision:** `tauri-plugin-blec v0.8.1`

**Rationale:** The only maintained BLE plugin in the Tauri ecosystem. Listed in Awesome Tauri. Covers all requirements: scan, connect, write, notify subscription. Works on both iOS (CoreBluetooth) and Android (via Tauri's Kotlin plugin system) via a unified TypeScript API. No custom Rust plugin required.

**iOS requirements:** `NSBluetoothAlwaysUsageDescription` in Info.plist + `CoreBluetooth` framework + `blec:default` in capabilities file.

**Alternatives considered:** Custom Rust plugin — rejected, adds significant maintenance burden for no feature gain. Web Bluetooth — rejected, not supported on iOS Safari.

---

## Tauri App Frontend Sharing

**Decision:** New `app/` workspace in the monorepo, sharing Vue 3 components via `server/web/src/` as a symlinked or workspace-referenced package.

**Rationale:** The existing Vue 3 web frontend (at `server/web/`) contains the dashboard components. The Tauri app needs mobile-specific screens (provisioning flow) alongside the existing dashboard. The cleanest split: the Tauri app has its own `app/` directory with `src-tauri/` for the Rust shell and its own `src/` for mobile-specific Vue pages, importing shared components from the web package via pnpm workspace.

**Project root addition:**
```
app/
├── src/                    # Mobile-specific Vue 3 pages + components
├── src-tauri/              # Tauri Rust shell
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/lib.rs
├── index.html
├── vite.config.ts
└── package.json
```

**pnpm workspace:** `app` added to `pnpm-workspace.yaml`.

---

## Hub Registration Protocol

**Decision:** `POST /api/register` endpoint on the hub, gated by an in-memory pairing window.

**Pairing window:** A server-side in-memory timer (default 5 minutes). Started via `POST /api/provision/open`. Only new `hw_id`s are rejected outside the window; known `hw_id`s (re-registration) bypass the gate.

**Alternatives considered:** Pre-shared token via BLE — rejected, complicates the generic firmware goal. Open registration — rejected as a security concern (any LAN device could self-register).

---

## Server Database Migration Strategy

**Decision:** Extend the existing sql.js schema initialization in `TelemetryService.ts` with two new tables added via `CREATE TABLE IF NOT EXISTS`.

**Rationale:** The existing schema init already uses this pattern. No migration framework is needed at this project scale. New tables are additive and don't alter the `readings` table.

**New tables:** See `data-model.md`.
