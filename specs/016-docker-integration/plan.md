# Implementation Plan: Docker Integration

**Branch**: `016-docker-integration` | **Date**: 2026-04-23 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/016-docker-integration/spec.md`
**Input**: Feature specification from `/specs/016-docker-integration/spec.md`

## Summary

Package Anthos as a single NAS-friendly container that serves the existing dashboard and API from one entry point, while preserving data on a mounted host volume and supporting repeatable upgrades.

## Technical Context

**Language/Version**: TypeScript 5.8 on Node.js 20, with Vue 3.5 for the app shell  
**Primary Dependencies**: Express 4.21, sql.js 1.14, Vue Router 5, Pinia 3, Vite 6, nyx-kit 2, pnpm workspace  
**Storage**: Host-mounted persistent directory for `server/db/anthos.db` and related runtime files; built frontend assets served from `app/dist` in the image  
**Testing**: Vitest plus build/smoke verification for the container image and deployed service  
**Target Platform**: Docker-capable Linux NAS or equivalent home server  
**Project Type**: web-service  
**Performance Goals**: Container should become reachable quickly after startup and remain usable through routine restarts and upgrades  
**Constraints**: Single-container deployment, same entry point for dashboard and API, no data loss on restart, NAS-hosted storage must be writable  
**Scale/Scope**: One home installation, one operator, one active deployment instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| Project-First Development | PASS | Feature has an approved spec before planning work. |
| Documentation as Source of Truth | PASS | Deployment behavior is being captured in specs and plan docs. |
| Test-Driven Development | PASS | Plan includes build and smoke verification for the container flow. |
| Canonical String Enums | PASS | No new shared string contract is introduced by this feature. |
| Readable SQL | PASS | No new SQL work is required for the Docker integration itself. |

## Project Structure

### Documentation (this feature)

```text
specs/016-docker-integration/
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

### Source Code (repository root)

```text
server/api/
├── src/
│   ├── app.ts
│   ├── routes/
│   └── services/
app/
├── src/
└── package.json
shared/
└── src/
```

**Structure Decision**: This feature preserves the existing server/app/shared split and adds deployment documentation around a single container image that serves the compiled frontend and API from the same process.

## Complexity Tracking

None. The feature stays within the current application shape and does not require exceptions to the constitution.
