# AGENTS.md

# Anthos Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-12

## Active Technologies

| Layer | Language / Runtime | Key Dependencies |
|---|---|---|
| Node firmware | C++ (Arduino framework, ESP-IDF base) | NimBLE-Arduino, Arduino Preferences, ESPmDNS, ArduinoJson 7, M5Unit-ENV, BH1750 |
| Hub server API | TypeScript 5.8 (Node.js 20) | Express 4.21, sql.js 1.14, cors |
| Frontend app | TypeScript + Vue 3.5 + Rust (Tauri v2) | Vite 6, Pinia 3, Vue Router 5, nyx-kit 2, Sass, Vitest, tauri-plugin-blec 0.8 |
| Package manager | pnpm (workspace) | pnpm-workspace.yaml |
| Firmware build | PlatformIO | M5Stack AtomS3 Lite (ESP32-S3), Arduino framework |

## Project Structure

```text
anthos/
├── node/                        # PlatformIO firmware (ESP32-S3)
│   ├── platformio.ini
│   └── src/                     # C++ source (23 files)
│       ├── main.cpp
│       ├── NodeApp.h/cpp        # App orchestration
│       ├── AppConfig.h/cpp      # NVS-backed config (wifi, server_url, node_id)
│       ├── BleProvisioning.h/cpp # BLE GATT server (provisioning mode)
│       ├── ProvisioningManager.h/cpp # Boot state machine
│       ├── HubClient.h/cpp      # mDNS discovery + /api/register
│       ├── ApiClient.h/cpp      # HTTP telemetry push
│       ├── SensorManager.h/cpp  # Sensor orchestration
│       └── ...                  # Sensor drivers, I2C, Logger, NodeHealth
│
├── server/
│   └── api/src/                 # Express API (serves app/dist/ in production)
│       ├── routes/createApiRouter.ts
│       ├── controllers/
│       │   ├── IngestController.ts
│       │   └── ProvisionController.ts
│       └── services/
│           ├── TelemetryService.ts    # SQLite schema + telemetry
│           ├── NodeRegistryService.ts # hardware_nodes + logical_nodes
│           └── PairingWindowService.ts
│
├── shared/src/                  # Shared TypeScript types (@anthos/shared)
│   ├── index.ts
│   └── telemetry.ts
│
├── app/                         # Unified frontend: dashboard + provisioning (Tauri v2)
│   ├── src/
│   │   ├── dashboard/           # Telemetry dashboard feature
│   │   ├── nodes/               # Node management feature
│   │   ├── shared/              # Shared assets, router, types
│   │   ├── views/               # App-level views (HomeView, ProvisionView)
│   │   └── composables/         # useBleProvisioning
│   └── src-tauri/               # Rust shell + tauri-plugin-blec
│
├── specs/                       # Feature specifications (speckit)
├── docs/                        # Architecture docs + roadmap
└── AGENTS.md                    # Repository guidance
```

## Commands

### Firmware (PlatformIO)
```bash
cd node
pio run --target upload      # Build and flash to connected AtomS3 Lite
pio device monitor --baud 115200  # Serial monitor
pio test                     # Run unit tests
```

### Server
```bash
pnpm install                          # Install all workspace dependencies
pnpm --filter @anthos/api dev         # Run API server (port 8088, watch mode)
pnpm --filter @anthos/api test        # Run API tests (Vitest)
```

### App (Frontend + Tauri)
```bash
pnpm --filter anthos-app dev          # Run in browser at port 1440 (no BLE)
pnpm --filter anthos-app build        # Build for production (outputs app/dist/)
pnpm --filter anthos-app test         # Run frontend tests (Vitest)
pnpm --dir app tauri android dev      # Run on Android device/emulator
pnpm --dir app tauri ios dev          # Run on iOS simulator (macOS only)
```

### Feature Workflow (speckit)
```
/speckit.specify   # Create spec from description
/speckit.clarify   # Resolve ambiguities (max 5 questions)
/speckit.plan      # Generate research, data model, contracts
/speckit.tasks     # Generate task breakdown
```

## Code Style

### C++ (Firmware)
- Class-per-concern: each subsystem is its own `.h`/`.cpp` pair
- Logger macros for all output (`LOG_INFO`, `LOG_ERROR`) — no raw `Serial.print`
- `Preferences` namespace is always `"anthos"` — never create new namespaces
- State machines are explicit enums, not boolean flags
- No dynamic memory allocation in hot loops (sensor read, telemetry push)

### TypeScript (Server + App)
- Strict TypeScript (`"strict": true`)
- Services own DB access — controllers never touch sql.js directly
- All API response shapes are defined as TypeScript types in `shared/` (`@anthos/shared`)
- Vitest for all tests; no Jest
- Use string enums for named string values that cross module boundaries or appear in shared contracts.
- Prefer the enum member name in code, not raw string literals, when referencing those values.

### Vue 3 (Dashboard + App)
- Composition API only (`<script setup>`)
- Pinia stores for server state; `ref`/`computed` for local UI state
- nyx-kit components for UI primitives across the app; if a needed primitive is missing, surface it instead of introducing a custom replacement

## Key Design Invariants

- `plant ≠ node ≠ sensor` — these are separate entities, never conflated
- `hw_id` is immutable (ESP32 eFuse MAC); `node_id` is hub-assigned and stable
- Pairing window gates new registrations; re-registrations (same `hw_id`) bypass it
- BLE session closes after WiFi result is reported — hub registration proceeds over WiFi
- Firmware binary is generic — no per-device config at flash time
- `node_id` format: `node-001`, `node-002` (zero-padded counter, not UUIDs)

## Recent Changes

| Feature | Branch | What it added |
|---|---|---|
| Log Viewer | `007-logviewer` | Daily log archives, server-served log history, `Anthos.logs`, and a dedicated frontend logs store/viewer |
| Telemetry Dashboard | `001-telemetry-dashboard` | SQLite `readings` table, `/api/ingest`, `/api/readings`, Vue dashboard with live chart, NTP sync |
| Generic Node Provisioning | `002-generic-node-provisioning` | BLE GATT provisioning, NVS config, mDNS hub discovery, `/api/register`, pairing window, `hardware_nodes`/`logical_nodes` tables, Unclaimed Nodes UI, Tauri mobile app scaffold |
| Monorepo Restructure | `003-monorepo-restructure` | `server/shared/` → `shared/` as `@anthos/shared`; merged `server/web/` into `app/`; API serves `app/dist/` as static files; deleted `server/web/` |

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
