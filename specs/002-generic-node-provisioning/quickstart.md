# Quickstart: Generic Node Provisioning Dev Setup

**Branch**: `002-generic-node-provisioning` | **Date**: 2026-04-06

## Prerequisites

- pnpm (workspace manager)
- Node.js 20+
- PlatformIO CLI (`pip install platformio`) or PlatformIO IDE extension
- Rust + Cargo (for Tauri app)
- Tauri CLI v2: `cargo install tauri-cli --version "^2"`
- Android Studio (for Android target) or Xcode (for iOS target)
- An M5Stack AtomS3 Lite connected via USB

---

## 1. Server

```bash
# Install dependencies
pnpm install

# Run the API server (watch mode)
pnpm --filter @anthos/api dev

# Run the web dashboard (watch mode)
pnpm --filter @anthos/web dev
```

API runs on `http://localhost:3000`.  
Dashboard runs on `http://localhost:5173`.

### New endpoints to test:
```bash
# Open pairing window
curl -X POST http://localhost:3000/api/provision/open

# Check window status
curl http://localhost:3000/api/provision/status

# Simulate node registration (once window is open)
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"hwId":"AABBCCDDEEFF","firmwareVersion":"1.0.0"}'

# List all nodes
curl http://localhost:3000/api/nodes

# Claim a node
curl -X PATCH http://localhost:3000/api/nodes/node-001 \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Living Room Monstera"}'
```

---

## 2. Node Firmware

```bash
cd node

# Build and upload to connected AtomS3 Lite
pio run --target upload

# Monitor serial output
pio device monitor --baud 115200
```

**Expected first-boot output:**
```
[BOOT] No WiFi credentials in NVS. Entering BLE provisioning mode.
[BLE] Advertising as "Anthos-EEFF"
[BLE] Waiting for credentials...
```

**Expected post-provisioning output:**
```
[WIFI] Connecting to MyNetwork...
[WIFI] Connected. IP: 192.168.1.42
[BLE] Notifying success. Closing BLE session.
[mDNS] Resolving anthos.local...
[mDNS] Hub found at http://192.168.1.10:3000
[REG] Registering with hw_id=AABBCCDDEEFF...
[REG] Assigned node_id=node-001. Stored in NVS.
[LOOP] Starting telemetry loop.
```

**To trigger factory reset:** Hold the button on the AtomS3 Lite for 3 seconds.

---

## 3. Tauri Mobile App

```bash
cd app

# Install JS dependencies
pnpm install

# Run in browser (no BLE — for dashboard dev only)
pnpm dev

# Run on Android (requires Android Studio + emulator or device)
pnpm tauri android dev

# Run on iOS (requires Xcode + simulator, macOS only)
pnpm tauri ios dev
```

**BLE scanning only works on physical devices**, not emulators/simulators. Use a real Android or iOS device for end-to-end provisioning testing.

---

## End-to-End Test Flow

1. Flash node firmware to a freshly erased AtomS3 Lite
2. Open serial monitor — confirm BLE advertising starts
3. In the Tauri app on a real phone: tap **Add Node**
4. App opens pairing window on hub automatically
5. App discovers node in BLE scan list as `Anthos-EEFF`
6. Select node, enter WiFi credentials, tap **Connect**
7. Node joins WiFi — app shows success
8. Node appears in hub dashboard under **Unclaimed Nodes**
9. Tap **Name this node** in the dashboard → assign a display name
10. Node moves from **Unclaimed** to the main node list and begins sending telemetry
