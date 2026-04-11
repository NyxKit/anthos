# Implementation Plan: Anthos Domain Layer

**Branch**: `005-anthos-domain` | **Date**: 2026-04-11 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/005-anthos-domain/spec.md`
**Input**: Feature specification from `/specs/005-anthos-domain/spec.md`

## Summary

Create a shared Anthos domain layer that owns backend-facing calls and connection state, starting with nodes and a reusable singleton setup flow. Existing stores will stop calling the backend directly and instead consume Anthos results for state management.

## Technical Context

**Language/Version**: TypeScript 5.8  
**Primary Dependencies**: Vue 3.5, Pinia 3, `@anthos/shared`, Tauri v2  
**Storage**: N/A for this layer; it coordinates backend access and in-memory setup state  
**Testing**: Vitest  
**Target Platform**: Desktop/web app runtime with a shared domain package  
**Project Type**: Desktop app with shared library layer  
**Performance Goals**: One-time setup should be reusable across subdomains; store-level consumers should avoid duplicate backend wiring  
**Constraints**: The shared layer must be extractable into a separate package later; current feature must not expose rooms, alerts, or users beyond scaffolds  
**Scale/Scope**: Migrate current node and telemetry access paths; leave future domains scaffolded only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Project-First Development: PASS. Spec and plan exist before implementation.
- Documentation as Source of Truth: PASS. Feature behavior is captured in `spec.md`, `research.md`, and design docs in `specs/`.
- Test-Driven Development: PASS. The work is scoped for testable domain methods and store migration.

## Project Structure

### Documentation (this feature)

```text
specs/005-anthos-domain/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
shared/src/
├── anthos/
│   ├── index.ts
│   ├── classes/
│   │   ├── Anthos.ts
│   │   ├── AnthosNodes.ts
│   │   ├── AnthosRooms.ts
│   │   ├── AnthosAlerts.ts
│   │   └── AnthosUsers.ts
│   └── types/
└── index.ts

app/src/
├── dashboard/
│   └── stores/
├── nodes/
│   └── stores/
└── shared/
```

**Structure Decision**: Place the shared Anthos domain in `shared/src/anthos` so the app can consume it as a single boundary while keeping the code extractable into a standalone package later. Update dashboard and node stores to call Anthos instead of reaching into backend routes directly.

## Complexity Tracking

No constitution violations require justification.
