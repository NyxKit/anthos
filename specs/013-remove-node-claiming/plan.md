# Implementation Plan: Remove Node Claiming

**Branch**: `013-remove-node-claiming` | **Date**: 2026-04-18 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/013-remove-node-claiming/spec.md`
**Input**: Feature specification from `/specs/013-remove-node-claiming/spec.md`

**Note**: This plan removes claim-related state and contracts from the UI, API, shared types, and firmware so nodes are shown directly as they come online.

## Summary

Remove the claim workflow entirely and present nodes as immediately available records. The implementation will delete claim-specific API routes, shared types, and firmware/server state, while preserving node registration, naming, capability, ordering, power profile, and telemetry behavior.

## Technical Context

**Language/Version**: TypeScript 5.8 and C++ (Arduino framework)  
**Primary Dependencies**: Express 4.21, sql.js 1.14, Vue 3.5, Tauri v2, NimBLE-Arduino, Arduino Preferences, nyx-kit  
**Storage**: SQLite via sql.js on the API side; NVS on the device; no new storage system required  
**Testing**: Vitest for TS code, PlatformIO tests for firmware  
**Target Platform**: ESP32-S3 firmware, Node API server, desktop/mobile app shell  
**Project Type**: Monorepo with firmware, API service, shared contracts, and frontend app  
**Performance Goals**: Nodes remain visible on the next normal refresh after registration, with no additional claim step  
**Constraints**: Remove claim-related traces from UI, API, shared contracts, and firmware together; preserve existing node data and behavior outside claiming  
**Scale/Scope**: Existing Anthos node fleet and current registry tables; no expansion of node count assumptions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pass. The feature is specified before implementation, documented in `specs/`, and keeps shared string values modeled consistently in the design. SQL updates remain readable and multiline.

## Project Structure

### Documentation (this feature)

```text
specs/013-remove-node-claiming/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
node/                # ESP32-S3 firmware
server/api/src/      # Express API + SQLite-backed node registry
shared/src/          # Shared contracts and node models
app/src/             # Vue/Tauri node management UI
specs/013-remove-node-claiming/
```

**Structure Decision**: Use the existing monorepo layout and update the firmware, API, shared contracts, and app together so there is no mixed claim/non-claim behavior.

## Complexity Tracking

None.
