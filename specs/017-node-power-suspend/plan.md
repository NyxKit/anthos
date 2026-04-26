# Implementation Plan: Node Power Suspend

**Branch**: `[017-node-power-suspend]` | **Date**: 2026-04-24 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/017-node-power-suspend/spec.md`
**Input**: Feature specification from `/specs/017-node-power-suspend/spec.md`

## Summary

Keep the node continuously active in performance mode, but in every other mode let it wake once per configured interval, process telemetry and queue work, then power back down after a short grace window. The planned cutoff is 5 minutes and the grace window is 10 seconds.

## Technical Context

**Language/Version**: C++ (Arduino framework on ESP32-S3)  
**Primary Dependencies**: NimBLE-Arduino, Arduino Preferences, ESPmDNS, ArduinoJson 7, PlatformIO  
**Storage**: NVS-backed device configuration  
**Testing**: PlatformIO unit tests and device-level validation  
**Target Platform**: ESP32-S3 firmware on M5Stack AtomS3 Lite  
**Project Type**: embedded firmware  
**Performance Goals**: preserve battery life by avoiding unnecessary active time outside wake windows  
**Constraints**: performance mode must never auto-suspend; non-performance modes must use one wake interval plus a short grace window  
**Scale/Scope**: single-device firmware behavior applied consistently across all nodes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| Project-First Development | Pass | Spec exists before implementation work. |
| Documentation as Source of Truth | Pass | Plan and design artifacts are being written under `specs/`. |
| Test-Driven Development | Pass | Plan includes firmware tests and device validation. |
| Canonical String Enums | Pass | No new shared string contract introduced. |
| Readable SQL | Pass | No SQL involved. |

## Project Structure

### Documentation (this feature)

```text
specs/017-node-power-suspend/
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

### Source Code (repository root)

```text
node/
├── src/
│   ├── NodeApp.*
│   ├── ProvisioningManager.*
│   ├── SensorManager.*
│   ├── ApiClient.*
│   └── ...
└── platformio.ini
```

**Structure Decision**: This feature stays inside the embedded firmware under `node/src/` and does not introduce new app, server, or contract surfaces.

## Phase 0: Research

### Findings

- Default cutoff threshold: 5 minutes.
- Default grace window: 10 seconds.
- Performance mode is the only mode that must never auto-suspend.
- The cutoff applies only to suspend decisions between scheduled wake intervals.

### Research Artifacts

- `research.md` documents the cutoff choice and the operating rules.

## Phase 1: Design

### Data Model

- `data-model.md` captures power mode, telemetry interval, and suspend cutoff as the core concepts.

### Contracts

- No external interface contracts are required for this firmware-only change.

### Quickstart

- `quickstart.md` covers validation steps on the target device.

## Complexity Tracking

No constitution violations require justification.
