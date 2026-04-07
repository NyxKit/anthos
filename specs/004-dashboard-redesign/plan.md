# Implementation Plan: Dashboard Design Integration

**Branch**: `004-dashboard-redesign` | **Date**: 2026-04-07 | **Spec**: `spec.md`
**Input**: Feature specification from `/specs/004-dashboard-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Redesign the Anthos dashboard with new visual design using nyx-kit component library, including sidebar navigation, top app bar, summary metrics, node grid, activity log, and system health panel.

## Technical Context

**Language/Version**: TypeScript 5.6 (Vue 3.5), Sass  
**Primary Dependencies**: nyx-kit ^2.0.16, Vue 3.5, Pinia 3, Vue Router 5  
**Storage**: N/A (frontend only)  
**Testing**: Vitest  
**Target Platform**: Web browser (desktop + mobile responsive)  
**Project Type**: Web application (Vue 3 SPA with Tauri for mobile)  
**Performance Goals**: Initial load <2s, real-time updates via polling  
**Constraints**: Must use nyx-kit primitives for all UI components  
**Scale/Scope**: 4 summary cards, node grid (expected 10-20 nodes), activity log, health panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Project-First: Clear specification exists | PASS |
| Documentation: Decisions in specs/ | PASS |
| Test-Driven: Tests written before impl | DEFER to implementation |

**Constitution Check**: Gates passed. Specification is clear and documented. Testing approach will be determined during implementation.

## Project Structure

### Documentation (this feature)

```text
specs/004-dashboard-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) - N/A for frontend
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── src/
│   ├── dashboard/           # Dashboard feature (main focus)
│   │   ├── views/
│   │   │   └── DashboardView.vue
│   │   ├── components/
│   │   │   ├── NodeCard.vue
│   │   │   ├── SensorList.vue
│   │   │   └── StatusIndicator.vue
│   │   ├── stores/
│   │   │   └── telemetry.ts
│   │   └── api/
│   │       └── readings.ts
│   ├── nodes/               # Node management feature
│   ├── shared/              # Shared (router, types, assets)
│   ├── views/               # Top-level views
│   ├── composables/         # Vue composables
│   ├── App.vue
│   └── main.ts
├── package.json
└── vite.config.ts
```

**Structure Decision**: Vue 3 SPA with Pinia for state management. Dashboard feature is in `app/src/dashboard/` with existing components that will be redesigned.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |