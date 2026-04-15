# Implementation Plan: Power Profiles

**Branch**: `[011-power-profiles]` | **Date**: 2026-04-14 | **Spec**: [/home/arnedecant/Projects/nyxkit/anthos/specs/011-power-profiles/spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-power-profiles/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add per-node power profiles that control telemetry and action-queue cadence, with the app sending interval values to the node rather than hardcoding them in firmware.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.8 (app + server), C++ (firmware)  
**Primary Dependencies**: Vue 3.5, Pinia 3, Express 4.21, Arduino framework, nyx-kit 2.x  
**Storage**: Repo-authored JSON profile config loaded by the server; node-side persisted settings in NVS  
**Testing**: Vitest for app/server, PlatformIO tests for firmware  
**Target Platform**: AtomS3 Lite nodes with Anthos app + API
**Project Type**: web app + server + embedded firmware  
**Performance Goals**: Profile changes should take effect on the next cadence cycle after the node receives them  
**Constraints**: Profile cadence values must remain editable from the app; server owns the editable config; node must not hardcode profile intervals  
**Scale/Scope**: Single profile per node with three default presets and editable interval values; assigned profile state and applied profile state are tracked separately

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Project-first development: pass, because behavior is specified before implementation.
- Documentation as source of truth: pass, because profile definitions belong in the spec and planning docs.
- Test-driven development: pass, because the design includes testable contracts and scenarios.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
