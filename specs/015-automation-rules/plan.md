# Implementation Plan: Automations

**Branch**: `015-automation-rules` | **Date**: 2026-04-21 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/015-automation-rules/spec.md`
**Input**: Feature specification from `/specs/015-automation-rules/spec.md`

## Summary

Add an automations page where operators can create, edit, delete, and review threshold-based watering rules, then evaluate those rules server-side when new sensor readings arrive. The implementation reuses the existing command queue for watering, records all rule lifecycle and trigger activity in the log archive, and keeps the first release limited to watering actions with a 30-minute suppression window after a trigger.

## Technical Context

**Language/Version**: TypeScript 5.8 on Node.js 20, Vue 3.5 in the desktop app  
**Primary Dependencies**: Express 4.21, sql.js 1.14, Pinia 3, Vue Router 5, nyx-kit, Vitest, Tauri v2  
**Storage**: SQLite via sql.js in the existing Anthos database  
**Testing**: Vitest for server and app tests  
**Target Platform**: Desktop app plus local API server  
**Project Type**: Desktop web application with local API service  
**Performance Goals**: Automation evaluation must not add noticeable delay to telemetry ingest; 95% of readings should be processed and evaluated within 1 second of arrival while ingest continues normally, and list and form interactions should feel immediate in normal use  
**Constraints**: Must reuse the existing command queue, use canonical enums for action/operator values, and require no firmware changes  
**Scale/Scope**: Single feature area with one automation action type at launch and a table-driven management UI

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Project-first development: pass
- Documentation as source of truth: pass
- Test-driven development: pass
- Canonical string enums: pass
- Readable SQL: pass

## Project Structure

### Documentation (this feature)

```text
specs/015-automation-rules/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── automations-api.md
└── tasks.md
```

### Source Code (repository root)

```text
server/api/src/
├── controllers/
│   └── AutomationController.ts
├── services/
│   ├── AutomationService.ts
│   └── AutomationEvaluator.ts
└── routes/createApiRouter.ts

shared/src/
├── automations.ts
├── anthos/classes/
│   └── AnthosAutomations.ts
└── anthos/types/

app/src/
├── automations/
│   ├── views/
│   ├── components/
│   ├── stores/
│   └── types/
└── shared/router/index.ts
```

**Structure Decision**: Implement the feature as a server-backed automation module shared between the API, shared contracts, and the Vue desktop app. Keep the rule editor/list UI in `app/src/automations`, server persistence and evaluation in `server/api/src`, and shared enums/types in `shared/src`.

## Research

See `research.md` for implementation decisions.

## Design

See `data-model.md` and `contracts/automations-api.md` for the schema and API surface.

## Validation

No constitution violations identified. No complexity justification required.
