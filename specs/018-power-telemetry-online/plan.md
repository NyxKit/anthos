# Implementation Plan: Power Telemetry Online Status

**Branch**: `[018-power-telemetry-online]` | **Date**: 2026-04-26 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/018-power-telemetry-online/spec.md`
**Input**: Feature specification from `/specs/018-power-telemetry-online/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Keep nodes shown as online while they are intentionally quiet under balanced or power saver profiles, and only mark them offline after they have exceeded the profile-specific silence threshold. The implementation centers on the shared node status calculation so every consumer of node status uses the same profile-aware logic.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.8, Vue 3.5, Node.js 20  
**Primary Dependencies**: `@anthos/shared`, Pinia, Vue, Express, sql.js, Vitest  
**Storage**: SQLite-backed server state; no new persistent entities required  
**Testing**: Vitest unit and component tests  
**Target Platform**: Desktop app and API server on Linux/macOS/Windows  
**Project Type**: Web application + API service  
**Performance Goals**: Status evaluation should remain instantaneous during normal UI refreshes  
**Constraints**: Preserve the existing three-profile cadence model and keep the status meaning consistent across the app  
**Scale/Scope**: Applies to all managed nodes displayed in the dashboard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

I. Project-First Development: Pass - feature is fully specified before implementation.

II. Documentation as Source of Truth: Pass - behavior and decisions are captured in `specs/` artifacts.

III. Test-Driven Development: Pass - plan prioritizes updating shared logic tests and NodeCard coverage before code changes.

IV. Canonical String Enums: Pass - existing power profile and node status enums remain the source of truth.

V. Readable SQL: Pass - no new SQL behavior is required by this feature.

## Project Structure

### Documentation (this feature)

```text
specs/018-power-telemetry-online/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
shared/src/
├── nodes/
│   ├── classes/         # Shared node status logic lives here
│   ├── data/
│   └── types/
app/src/
├── dashboard/
│   ├── components/      # NodeCard status label uses shared status logic
│   └── stores/
└── shared/
    └── utils/           # Telemetry threshold tests and helpers
server/api/src/
├── controllers/
└── services/
```

**Structure Decision**: Update shared node status calculation in `shared/src/nodes/classes/PlantNode.ts` so it uses the later of the last telemetry timestamp and the last power-profile assignment timestamp, then verify the dashboard NodeCard still renders the shared status correctly. No new API route or database table is needed.

No contract files are required for this feature because it does not introduce a new external interface.
