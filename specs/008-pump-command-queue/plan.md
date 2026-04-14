# Implementation Plan: Pump Command Queue

**Branch**: `[008-pump-command-queue]` | **Date**: 2026-04-14 | **Spec**: [/home/arnedecant/Projects/nyxkit/anthos/specs/008-pump-command-queue/spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-pump-command-queue/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a command-polling flow so nodes can retrieve pending pump actions from the server on a short interval, execute them independently of telemetry cadence, and acknowledge completion or failure back to the server.

## Technical Context

**Language/Version**: C++ (firmware), TypeScript 5.8 / Node.js 20 (server)  
**Primary Dependencies**: Arduino framework, Express 4.21, sql.js 1.14, ArduinoJson 7, NimBLE-Arduino  
**Storage**: SQLite-backed server state; node-side NVS for identity/configuration  
**Testing**: PlatformIO tests for firmware, Vitest for server and shared code  
**Target Platform**: ESP32-S3 node hardware and local/server runtime  
**Project Type**: web-service + embedded firmware  
**Performance Goals**: Command availability should be checked on a short interval and applied on the next poll in normal conditions  
**Constraints**: Must not depend on telemetry timing; command execution must be idempotent after acknowledgement  
**Scale/Scope**: Single-node command polling with queued actions per node

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

- Project-first development: pass, because the feature is specification-driven and the implementation plan is derived from the spec.
- Documentation as source of truth: pass, because the behavior is being defined in `specs/008-pump-command-queue/` artifacts before code changes.
- Test-driven development: pass, because the plan includes contract and behavior artifacts before implementation.

## Project Structure

### Documentation (this feature)

```text
specs/008-pump-command-queue/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
node/
├── src/
│   ├── ApiClient.cpp
│   ├── ApiClient.h
│   ├── EarthSensor.cpp
│   ├── EarthSensor.h
│   ├── NodeApp.cpp
│   ├── NodeApp.h
│   └── SensorManager.cpp

server/
└── api/
    └── src/
        ├── controllers/
        ├── routes/
        └── services/

shared/
└── src/
    ├── dashboard.ts
    ├── telemetry.ts
    └── index.ts

specs/
└── 008-pump-command-queue/
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/
```

**Structure Decision**: Use the existing monorepo layout: `node/` for firmware changes, `server/api/src/` for the command queue endpoints and storage logic, `shared/src/` for shared request/response types, and `specs/008-pump-command-queue/` for planning artifacts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
