# Tasks: Generic Node Provisioning

**Input**: Design documents from `specs/002-generic-node-provisioning/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Four user stories (US1–US4) map to plan phases A–F.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to ([US1]–[US4])
- Each task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — must complete before any implementation begins.

- [x] T001 Update `node/platformio.ini` lib_deps to add `h2zero/NimBLE-Arduino@^1.4.0`
- [x] T002 [P] Scaffold Tauri v2 app workspace at `app/` using `pnpm create tauri-app` and add `app` entry to `pnpm-workspace.yaml`
- [x] T003 [P] Add `bonjour-service` (mDNS advertising) dependency to `server/api/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared by all user stories. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: Blocks US1, US2, US3, and US4.

- [x] T004 Rewrite `node/src/AppConfig.h` and `node/src/AppConfig.cpp` to use Arduino `Preferences` NVS (namespace `"anthos"`, keys: `wifi_ssid`, `wifi_pass`, `server_url`, `node_id`) — remove all compile-time hardcoded WiFi/server/nodeId constants
- [x] T005 [P] Add `HardwareNodeRegistration` and `NodeRegistrationResponse` TypeScript types to `server/shared/src/telemetry.ts`
- [x] T006 [P] Extend schema initialization in `server/api/src/services/TelemetryService.ts` to create `hardware_nodes` and `logical_nodes` tables using `CREATE TABLE IF NOT EXISTS` per `data-model.md`

**Checkpoint**: NVS config compiles, DB tables exist, shared types defined — user stories can now proceed.

---

## Phase 3: User Story 1 — Flash Once, Deploy Many (Priority: P1) 🎯 MVP Start

**Goal**: A single firmware binary works for any node. First boot detects no credentials and enters provisioning mode. No per-device configuration required at flash time.

**Independent Test**: Flash the same `.bin` to two AtomS3 Lite devices. Both should boot, print `[BOOT] No credentials. Entering BLE provisioning mode.` to serial, and begin BLE advertising without any code changes between flashes.

- [x] T007 [US1] Create `node/src/ProvisioningManager.h` defining the boot state enum (`NO_CREDS`, `NO_NODE_ID`, `READY`) and the `ProvisioningManager` class interface
- [x] T008 [US1] Implement `node/src/ProvisioningManager.cpp` boot state detection: read NVS via `AppConfig`, set state to `NO_CREDS` if `wifi_ssid` absent, `NO_NODE_ID` if `wifi_ssid` present but `node_id` absent, `READY` if both present
- [x] T009 [US1] Update `node/src/NodeApp.cpp` `setup()` to instantiate `ProvisioningManager` and dispatch to the correct boot path based on state
- [x] T010 [US1] Update `node/src/main.cpp` to remove any remaining hardcoded config — all initialization must flow through `AppConfig` and `ProvisioningManager`

**Checkpoint**: Flash two devices with the same binary. Both boot into provisioning mode (state `NO_CREDS`). No per-device build needed.

---

## Phase 4: User Story 2 — BLE-Assisted WiFi Provisioning via App (Priority: P1)

**Goal**: The Tauri app discovers unprovisioned nodes over BLE, sends WiFi credentials, and the node joins the network. The BLE session closes after the WiFi result is reported.

**Independent Test**: With a node in BLE advertising mode, use the Tauri app to send WiFi credentials. Confirm serial output shows `[WIFI] Connected`, BLE session closes, and the app transitions to the hub registration step — without touching a config file or serial monitor.

### Firmware: BLE GATT Server

- [x] T011 [US2] Create `node/src/BleProvisioning.h` defining the `BleProvisioning` class with methods `begin()`, `stop()`, `isConnected()`, and GATT service/characteristic UUIDs from `contracts/ble-gatt.md`
- [x] T012 [US2] Implement `node/src/BleProvisioning.cpp`: derive advertisement name from `ESP.getEfuseMac()` (format `"Anthos-XXXX"`); create GATT service `4fafc201-...` with Credentials (write, UUID `beb5483e-...`) and Status (notify, UUID `6e400003-...`) characteristics; on credentials write: parse JSON, store to NVS via `AppConfig`, attempt WiFi connect, notify `connecting` → `success`/`failed`, close BLE session
- [x] T013 [US2] Wire `BleProvisioning` into `node/src/ProvisioningManager.cpp`: when state is `NO_CREDS`, call `BleProvisioning::begin()`; on BLE session completion, transition state to `NO_NODE_ID` (if success) or stay in `NO_CREDS` (if failed)

### App: Tauri Scaffold + BLE Plugin

- [x] T014 [US2] Add `tauri-plugin-blec = "0.8"` to `app/src-tauri/Cargo.toml` and register `tauri_plugin_blec::init()` in `app/src-tauri/src/lib.rs`
- [x] T015 [US2] Add `blec:default` to `app/src-tauri/capabilities/default.json` and add `NSBluetoothAlwaysUsageDescription` to iOS Info.plist
- [x] T016 [P] [US2] Implement `app/src/composables/useBleProvisioning.ts`: export `scanForNodes()` (filter by name prefix `"Anthos-"` and service UUID), `connectToNode(address)`, `sendCredentials(ssid, pass, serverUrl?)`, and reactive `status` ref updated from Status characteristic notifications
- [x] T017 [US2] Implement `app/src/views/ProvisionView.vue` with four screens driven by state: **Scan** (list discovered nodes with hardware ID suffix), **Select** (user taps a node), **Credentials** (SSID/password form, pre-filled from last session), **Progress** (connecting → success/failed feedback) — using `useBleProvisioning`
- [x] T018 [US2] Add `ProvisionView` route (`/provision`) and an "Add Node" entry point to `app/src/router/index.ts` and `app/src/App.vue`

**Checkpoint**: App discovers node in BLE scan, sends credentials, node joins WiFi, BLE session closes, app advances to hub registration screen.

---

## Phase 5: User Story 3 — Automatic Hub Registration and ID Assignment (Priority: P1)

**Goal**: After joining WiFi, the node discovers the hub via mDNS, registers its hardware ID, and receives a stable logical node ID stored in NVS. The hub only accepts new registrations during an open pairing window. Newly registered nodes appear as "Unclaimed" in the dashboard.

**Independent Test**: After WiFi provisioning, confirm the node appears in `GET /api/nodes` with a unique `node_id` and `claimStatus: "unclaimed"` — and that the "Unclaimed Nodes" section renders it in the dashboard — without any manual hub-side configuration.

### Server: Node Registry + Pairing Window

- [X] T019 [US3] Implement `server/api/src/services/NodeRegistryService.ts`: `upsertHardwareNode(hwId, firmwareVersion)`, `findLogicalNode(hwId)`, `createLogicalNode(hwId)` (generates next `node-00N` ID using `MAX(CAST(REPLACE(node_id,'node-','') AS INTEGER))` to avoid collision if rows are ever deleted), `listNodes()`, `claimNode(nodeId, displayName)`
- [X] T020 [US3] Implement `server/api/src/services/PairingWindowService.ts`: in-memory singleton with `open()` (sets 5-minute expiry), `isOpen()` (checks `Date.now() < expiresAt`), `getStatus()` (returns `{status, expiresAt?, remainingMs?}`)
- [X] T021 [US3] Implement `server/api/src/controllers/ProvisionController.ts`: wire `NodeRegistryService` and `PairingWindowService` to handle `POST /api/register` (per `contracts/api-register.md`), `POST /api/provision/open`, `GET /api/provision/status`, `GET /api/nodes`, `PATCH /api/nodes/:nodeId`
- [X] T022 [US3] Register all five new routes in `server/api/src/routes/createApiRouter.ts` (per `contracts/api-provision.md` and `contracts/api-register.md`)
- [X] T023 [US3] Add mDNS advertisement in `server/api/src/server.ts` on startup: advertise hostname `anthos` (resolves as `anthos.local`) on the local network using `bonjour-service`

### Firmware: mDNS Discovery + Registration

- [x] T024 [US3] Create `node/src/HubClient.h` defining `HubClient` with `discoverHub()` (returns URL string or empty), `registerWithHub(hwId, firmwareVersion)` (returns `nodeId` string or empty on failure)
- [x] T025 [US3] Implement `node/src/HubClient.cpp`: `discoverHub()` uses priority order — (1) NVS-stored `server_url` if present and reachable (HEAD /health check), (2) mDNS `ESPmDNS.queryHost("anthos", 5000)`, (3) retry loop every 30 seconds if both fail; `registerWithHub()` POSTs to `/api/register`, parses JSON response, stores returned `node_id` in NVS via `AppConfig`; retries every 30 seconds on 403 (pairing window closed)
- [x] T026 [US3] Wire `HubClient` into `node/src/ProvisioningManager.cpp`: when state is `NO_NODE_ID`, call `HubClient::discoverHub()` then `registerWithHub()`; on success transition to `READY` and invoke the existing `NodeApp` telemetry loop (same path as a configured boot); on 403 retry every 30 seconds; ensure the WiFi connection is monitored in the telemetry loop and re-established automatically if lost (the existing `NodeApp` reconnect behaviour should handle this — verify it does)

### App: Pairing Window Trigger + Hub Registration Feedback

- [x] T027 [US3] Update `app/src/composables/useBleProvisioning.ts` to call `POST /api/provision/open` at the start of the "Add Node" flow (before BLE scan) — app must open the pairing window before the node can register
- [x] T028 [US3] Update `app/src/views/ProvisionView.vue` Progress screen to poll `GET /api/provision/status` and `GET /api/nodes` after BLE success, showing "Waiting for hub registration…" until the new node appears; surface "hub not found" warning with manual IP/hostname entry field after 30-second timeout — this field re-points the *app* at the hub (not the node; the node's hub URL is set at BLE provisioning time via the optional `serverUrl` credentials field)

### Dashboard: Unclaimed Nodes UI

- [x] T029 [P] [US3] Implement `server/web/src/components/nodes/UnclaimedNodeCard.vue`: shows hardware ID suffix, registration timestamp, and a "Name this node" action button
- [x] T030 [P] [US3] Implement `server/web/src/components/nodes/ClaimNodeModal.vue`: input for display name, calls `PATCH /api/nodes/:nodeId`, emits `claimed` event on success — plant linking (FR-023 "optionally link to a plant") is out of scope for this feature; leave a `<!-- TODO: plant linking (Phase 3) -->` placeholder in the modal template
- [x] T031 [US3] Add nodes Pinia store or composable to `server/web/src/` that fetches `GET /api/nodes` and exposes `unclaimedNodes` and `claimedNodes` computed lists
- [x] T032 [US3] Update (or create) `server/web/src/views/NodesView.vue` to render unclaimed nodes at the top in a distinct "Unclaimed Nodes" section using `UnclaimedNodeCard` + `ClaimNodeModal`, followed by the claimed node list

**Checkpoint**: Node joins WiFi → discovers hub via mDNS → registers → appears in dashboard as "Unclaimed" → user assigns name → node moves to main list.

---

## Phase 6: User Story 4 — Factory Reset and Re-Provisioning (Priority: P2)

**Goal**: Holding the physical button for 3 seconds clears all NVS credentials and restarts the node into BLE provisioning mode. Re-provisioning to the same hub restores the original logical node ID.

**Independent Test**: Provision a node fully. Hold the button for 3 seconds. Confirm serial shows `[RESET] Factory reset triggered. Clearing NVS.` and the node re-enters BLE advertising mode. Re-provision — confirm the hub returns the same `node_id` as before.

- [x] T033 [US4] Implement button hold detection in `node/src/ProvisioningManager.cpp`: poll the AtomS3 Lite button GPIO in `loop()`; if held continuously for ≥ 3000 ms, trigger factory reset
- [x] T034 [US4] Implement factory reset in `node/src/AppConfig.cpp`: add `factoryReset()` method that opens the `"anthos"` Preferences namespace, calls `prefs.clear()`, closes it, and calls `ESP.restart()`
- [x] T035 [US4] Call `AppConfig::factoryReset()` from `ProvisioningManager` on button hold trigger; log `[RESET] Factory reset triggered. Clearing NVS.` before restart

**Checkpoint**: Factory reset wipes NVS, node re-enters BLE provisioning mode. Re-provisioning to the same hub restores the original `node_id` (FR-012 — re-registration bypasses pairing window for known `hw_id`).

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Reliability improvements, fallback paths, and end-to-end validation.

- [x] T036 [P] Add AP captive portal fallback to `node/src/ProvisioningManager.cpp`: if BLE provisioning mode times out (configurable, default 5 minutes) with no credentials received, start a WiFi AP named `"Anthos-Setup"` with a minimal web form for entering credentials
- [x] T037 [P] Add NVS corruption guard to `node/src/AppConfig.cpp`: if `Preferences::begin()` returns false or read values are empty/malformed, treat as first boot and enter provisioning mode rather than crashing
- [X] T038 Update `server/api/src/controllers/ProvisionController.ts` to handle firmware version mismatch: if registered `firmware_version` is below a minimum required version, include a `"firmware_outdated": true` flag in the 200/201 response (non-blocking for now)
- [x] T039 [P] Add hub URL persistence to `node/src/HubClient.cpp`: (a) if BLE credentials payload included a `serverUrl`, it was already stored in NVS by `BleProvisioning` — use it as primary; (b) if no stored URL exists and mDNS resolves successfully, store the resolved URL in NVS; (c) on boot, if stored URL is unreachable, fall back to mDNS re-query before entering the retry loop
- [ ] T040 Run the end-to-end test flow from `specs/002-generic-node-provisioning/quickstart.md` and confirm all 10 steps pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** — No dependencies. T001, T002, T003 can all start immediately and run in parallel.
- **Foundational (Phase 2)** — Depends on Phase 1 complete. T004, T005, T006 can run in parallel. **Blocks all user story phases.**
- **US1 (Phase 3)** — Depends on Foundational. No dependency on US2, US3, or US4.
- **US2 (Phase 4)** — Depends on Foundational + US1 complete (needs `ProvisioningManager` to wire into).
- **US3 (Phase 5)** — Depends on Foundational + US2 complete (firmware registration follows BLE provisioning). Server-side tasks (T019–T023) can start after Foundational.
- **US4 (Phase 6)** — Depends on US1 + US3 complete (needs full NVS + ProvisioningManager).
- **Polish (Phase 7)** — Depends on all user stories complete.

### Within Each User Story

- Models/types before services (T005 before T019)
- Services before controllers (T019, T020 before T021)
- Controllers before routes (T021 before T022)
- Firmware class interface before implementation (T011 before T012, T024 before T025)
- Implementation before wiring (T012 before T013, T025 before T026)

### Parallel Opportunities Within Phases

**Phase 1**: T001 + T002 + T003 all in parallel  
**Phase 2**: T004 (firmware), T005 + T006 (server-side) — all three can start in parallel; T005 and T006 are entirely independent of T004  
**Phase 4 (US2)**: T014 + T015 + T016 in parallel; T017 after T016  
**Phase 5 (US3)**: T019 + T020 in parallel; T024 + T029 + T030 in parallel; T023 + T031 in parallel  
**Phase 7**: T036 + T037 + T039 in parallel

---

## Parallel Example: User Story 3 (most parallel-friendly phase)

```
# Server side (can start after T005/T006 complete):
Task T019: Implement NodeRegistryService
Task T020: Implement PairingWindowService     ← parallel with T019

# Once T019 + T020 done:
Task T021: Implement ProvisionController      ← depends on T019 + T020
Task T022: Register routes                    ← depends on T021
Task T023: Add mDNS advertisement             ← parallel with T021

# Dashboard (can start after T006):
Task T029: UnclaimedNodeCard.vue              ← parallel with T030
Task T030: ClaimNodeModal.vue                 ← parallel with T029
Task T031: Nodes Pinia store/composable       ← after T029/T030 done
Task T032: NodesView.vue update               ← depends on T031

# Firmware (can start after T013 / WiFi working):
Task T024: HubClient.h interface
Task T025: HubClient.cpp implementation       ← depends on T024
Task T026: Wire into ProvisioningManager      ← depends on T025
```

---

## Implementation Strategy

### MVP (User Stories 1–3 only — fully functional provisioning loop)

1. **Phase 1**: Setup — update platformio.ini, scaffold Tauri app, add bonjour-service
2. **Phase 2**: Foundational — NVS config, DB schema, shared types
3. **Phase 3 (US1)**: Generic firmware boots into provisioning mode
4. **Phase 4 (US2)**: BLE provisioning via app delivers WiFi credentials
5. **Phase 5 (US3)**: Hub registration assigns node ID; dashboard shows unclaimed nodes
6. **STOP + VALIDATE**: Run quickstart.md end-to-end test (steps 1–9)
7. US4 and Polish are additive — ship MVP first

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (firmware compiles with NVS, DB has new tables)
2. + Phase 3 (US1) → Node boots generically, no manual ID
3. + Phase 4 (US2) → App provisions node over BLE
4. + Phase 5 (US3) → Full loop: WiFi → hub → telemetry → dashboard
5. + Phase 6 (US4) → Factory reset and recovery
6. + Phase 7 → Hardened for edge cases

---

## Notes

- 40 tasks total across 7 phases
- No test tasks generated (not requested in spec)
- BLE testing (T012, T013, T016) requires a physical Android or iOS device — emulators do not expose BLE hardware
- T027 (open pairing window from app) is a prerequisite for T026 (node registers) to succeed during end-to-end testing
- The server-side tasks in Phase 5 (T019–T023) can be started as soon as Phase 2 is done — they have no dependency on firmware or app work
- `node_id` generation in `NodeRegistryService` must be idempotent (same `hw_id` always returns same `node_id`)
