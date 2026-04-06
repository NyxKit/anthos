# Implementation Plan: Generic Node Provisioning

**Branch**: `002-generic-node-provisioning` | **Date**: 2026-04-06 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/002-generic-node-provisioning/spec.md`

## Summary

Replace manual node ID assignment and hardcoded WiFi credentials with a fully generic firmware that provisions itself via BLE (app sends WiFi creds), joins the home network, and registers with the hub via mDNS discovery. The hub assigns a stable logical node ID and presents unregistered nodes in an "Unclaimed Nodes" dashboard section for the user to name.

Three components require work: **node firmware** (BLE GATT server, NVS config, state machine), **hub server** (registration API, pairing window, DB schema, Unclaimed Nodes UI), and **Tauri mobile app** (new workspace, BLE scanning and provisioning flow).

---

## Technical Context

**Language/Version**: C++ (Arduino framework, ESP-IDF base) for firmware; TypeScript 5.8 (Node.js 20) for server; TypeScript + Vue 3.5 + Rust (Tauri v2) for app  
**Primary Dependencies**: NimBLE-Arduino (BLE GATT); Arduino Preferences + ESPmDNS (firmware); Express 4.21 + sql.js 1.14 (server); tauri-plugin-blec 0.8 (app BLE)  
**Storage**: SQLite via sql.js (server); ESP32 NVS via Arduino Preferences (firmware)  
**Testing**: PlatformIO unit tests (firmware); Vitest (server + app)  
**Target Platform**: ESP32-S3 (M5Stack AtomS3 Lite); Linux/Docker server host; Android 7+ / iOS 14+ (Tauri app)  
**Project Type**: Embedded firmware + web service + mobile app  
**Performance Goals**: BLE node discovery < 10s; WiFi join < 30s; hub registration < 5s after WiFi join  
**Constraints**: Generic firmware binary (no per-device config at flash time); BLE session closed after WiFi result reported  
**Scale/Scope**: Home use; small fleet (< 20 nodes per hub)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| Spec-first development | ✅ Pass | Full spec + clarifications completed before this plan |
| Documentation as source of truth | ✅ Pass | research.md, data-model.md, contracts/ all generated |
| Test-driven development | ✅ Pass | Acceptance scenarios defined per user story; test tasks deferred by choice (not requested in spec) |

No violations. No complexity tracking required.

---

## Project Structure

### Documentation (this feature)

```text
specs/002-generic-node-provisioning/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: library decisions and rationale
├── data-model.md        # Phase 1: DB schema + entity model
├── quickstart.md        # Phase 1: dev environment setup
├── contracts/
│   ├── api-register.md  # POST /api/register contract
│   ├── api-provision.md # Pairing window + node list API contracts
│   └── ble-gatt.md      # BLE GATT service specification
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code Changes

```text
node/                                 # Existing firmware — modified
├── platformio.ini                    # Add NimBLE-Arduino to lib_deps
└── src/
    ├── AppConfig.h / AppConfig.cpp   # Rewrite: NVS-backed config, boot state detection
    ├── BleProvisioning.h / .cpp      # NEW: GATT server, credentials write, status notify
    ├── ProvisioningManager.h / .cpp  # NEW: boot state machine (BLE → WiFi → register)
    ├── HubClient.h / HubClient.cpp   # NEW: POST /api/register, mDNS discovery
    ├── NodeApp.h / NodeApp.cpp       # Modified: integrate ProvisioningManager on boot
    └── main.cpp                      # Minimal change: no hardcoded config

server/
├── api/src/
│   ├── routes/
│   │   └── createApiRouter.ts        # Add /register, /provision/open, /provision/status, /nodes, /nodes/:id
│   ├── controllers/
│   │   ├── ProvisionController.ts    # NEW: pairing window logic, node CRUD
│   │   └── IngestController.ts       # Unchanged
│   ├── services/
│   │   ├── NodeRegistryService.ts    # NEW: hardware_nodes + logical_nodes DB operations
│   │   ├── PairingWindowService.ts   # NEW: in-memory pairing window timer
│   │   └── TelemetryService.ts       # Modified: add new table CREATE statements to schema init
│   └── shared/src/
│       └── telemetry.ts              # Add Node registration types
└── web/src/
    ├── views/
    │   └── NodesView.vue             # NEW or modified: add "Unclaimed Nodes" section
    └── components/nodes/
        ├── UnclaimedNodeCard.vue     # NEW: card for unclaimed node with "Name this node" action
        └── ClaimNodeModal.vue        # NEW: modal to assign display name

app/                                  # NEW Tauri v2 workspace
├── index.html
├── vite.config.ts
├── package.json
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/index.ts
│   ├── views/
│   │   ├── HomeView.vue              # Dashboard (reuses hub API)
│   │   └── ProvisionView.vue         # NEW: BLE scan → select → credentials → status
│   └── composables/
│       └── useBleProvisioning.ts     # NEW: wraps tauri-plugin-blec for provisioning flow
└── src-tauri/
    ├── Cargo.toml                    # tauri + tauri-plugin-blec dependencies
    ├── tauri.conf.json
    ├── capabilities/default.json     # blec:default permission
    └── src/
        └── lib.rs                    # Tauri app entry + blec plugin registration
```

**Structure Decision**: Three-workspace monorepo (`server/`, `node/`, `app/`). The `app/` workspace is new and added to `pnpm-workspace.yaml`. Server API and web remain under `server/`. Firmware remains under `node/`. The Tauri app in `app/` has its own `vite.config.ts` and `src-tauri/` — it does not share a build pipeline with `server/web/` but can import shared types from `server/shared/`.

---

## Implementation Phases

### Phase A — Server: DB Schema + Registration API

Touches: `server/api/src/services/TelemetryService.ts`, new `NodeRegistryService.ts`, new `PairingWindowService.ts`, new `ProvisionController.ts`, `createApiRouter.ts`

1. Extend `TelemetryService` schema init with `hardware_nodes` and `logical_nodes` tables
2. Implement `NodeRegistryService` (upsert hardware node, create/lookup logical node, list, claim)
3. Implement `PairingWindowService` (open, status, expiry check)
4. Implement `ProvisionController` (wire services to HTTP handlers)
5. Register new routes in `createApiRouter.ts`

**Contracts**: See `contracts/api-register.md` and `contracts/api-provision.md`

---

### Phase B — Server: Dashboard "Unclaimed Nodes" UI

Touches: `server/web/src/`

1. Add `GET /api/nodes` call to a new Pinia store or composable
2. Add `UnclaimedNodeCard.vue` component
3. Add `ClaimNodeModal.vue` component
4. Update nodes/dashboard view to render unclaimed nodes at top with a visual distinction

---

### Phase C — Firmware: NVS Config + Boot State Machine

Touches: `node/src/AppConfig.*`, new `ProvisioningManager.*`, `NodeApp.*`

1. Rewrite `AppConfig` to use `Preferences` NVS instead of compile-time constants
2. Add boot state detection (no creds → provisioning, creds + no nodeId → register, full → telemetry)
3. Implement `ProvisioningManager` as the boot state machine coordinator
4. Wire into `NodeApp::setup()`
5. Add factory reset on 3-second button hold

---

### Phase D — Firmware: BLE GATT Server

Touches: new `BleProvisioning.*`, `platformio.ini`

1. Add `h2zero/NimBLE-Arduino@^1.4.0` to `lib_deps`
2. Implement `BleProvisioning` class:
   - Derives advertisement name from `ESP.getEfuseMac()`
   - Creates GATT service with Credentials (write) + Status (notify) characteristics
   - Parses credentials JSON on write
   - Initiates WiFi connect, notifies status, closes BLE session on terminal status

**Contract**: See `contracts/ble-gatt.md`

---

### Phase E — Firmware: mDNS Discovery + Hub Registration

Touches: new `HubClient.*`

1. Implement `HubClient::discoverHub()` using `ESPmDNS.queryHost("anthos", 5000)`
2. Fall back to NVS-stored `server_url` if mDNS fails
3. Implement `HubClient::registerWithHub(hwId, firmwareVersion)` — POST `/api/register`, retry on 403 every 30s
4. Store returned `node_id` in NVS

---

### Phase F — Tauri App: Project Scaffold + BLE Provisioning Flow

Touches: new `app/` workspace

1. Scaffold Tauri v2 project with `pnpm create tauri-app` under `app/`
2. Add to `pnpm-workspace.yaml`
3. Add `tauri-plugin-blec` to Cargo.toml and register in `lib.rs`
4. Add `blec:default` capability
5. Implement `useBleProvisioning` composable:
   - Scan for devices advertising provisioning service UUID
   - Filter by name prefix `"Anthos-"`
   - Connect to selected device
   - Subscribe to Status characteristic
   - Write Credentials characteristic
   - Handle terminal status (success/failed)
6. Implement `ProvisionView.vue` with screens: Scan → Select Node → Enter Credentials → Progress → Done
7. Implement `POST /api/provision/open` call at start of "Add Node" flow

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| BLE library | NimBLE-Arduino | 50% flash savings vs Bluedroid; simpler API for GATT server |
| Hardware ID | `ESP.getEfuseMac()` → 12-char hex | Stable, factory-burned, available without IDF headers |
| NVS storage | Arduino `Preferences` | Built-in, key-value, survives reboot, clear-able for reset |
| Hub discovery | mDNS primary (`anthos.local`), NVS URL fallback | Zero-config for most home networks; fallback for problematic routers |
| Pairing security | Time-limited pairing window (5 min) | Prevents rogue devices; no per-device secrets required |
| Re-registration | Bypasses pairing window | Known `hw_id` → same `node_id` preserved; history continuity |
| node_id format | `node-001`, `node-002` (counter) | Human-readable; no UUIDs for a home product |
| App BLE plugin | tauri-plugin-blec v0.8 | Only maintained Tauri BLE plugin; covers iOS + Android |
| BLE session end | After WiFi result notified | Battery efficiency; hub registration proceeds over WiFi |
| Unclaimed nodes | Dedicated dashboard section | Clear call-to-action; avoids anonymous node accumulation |
