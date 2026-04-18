# Implementation Plan: Nodes Grid

**Branch**: `012-nodes-grid` | **Date**: 2026-04-18 | **Spec**: `/specs/012-nodes-grid/spec.md`
**Input**: Feature specification from `/specs/012-nodes-grid/spec.md`

## Summary

Create a reusable `NodesGrid` view component that reads from the existing nodes store, supports an optional limit, and is used by both the dashboard and the nodes page so claimed-node presentation stays consistent while preserving the existing claim flow for unclaimed nodes.

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.5  
**Primary Dependencies**: Pinia, nyx-kit, Vue Router 5  
**Storage**: N/A (consumes existing in-memory/store-backed node data)  
**Testing**: Vitest, vue-tsc  
**Target Platform**: Desktop web app via Tauri and browser dev mode  
**Project Type**: Desktop web application  
**Performance Goals**: Show the node grid immediately from existing store state with no separate data fetch  
**Constraints**: Keep the public component API to a single optional `limit` prop; preserve existing claim flow  
**Scale/Scope**: Two primary consumers initially: dashboard and nodes page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Pass: Feature starts from a spec and keeps the spec as source of truth.
- Pass: Planned work is documented in `specs/012-nodes-grid/` before implementation.
- Pass: The feature should be test-first friendly because the shared grid behavior is observable in UI tests.
- Pass: Shared node status values remain modeled as enums; no new ad hoc string unions are introduced.
- Pass: No SQL changes are required for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/012-nodes-grid/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Not expected for this internal UI feature
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
app/src/nodes/
├── components/
├── stores/
└── views/

app/src/dashboard/
├── components/
└── views/

shared/src/nodes/
├── classes/
├── data/
└── types/
```

**Structure Decision**: This feature stays inside the existing web application structure. The reusable grid belongs in `app/src/nodes/components/`, with the dashboard and nodes page consuming it through the existing store-backed node data.

## Complexity Tracking

No constitution violations require justification.
