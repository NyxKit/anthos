# Implementation Plan: Log Viewer

**Branch**: `007-logviewer` | **Date**: 2026-04-12 | **Spec**: `/specs/007-logviewer/spec.md`
**Input**: Feature specification from `/specs/007-logviewer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a dedicated logs area that shows incoming node messages live and from history. The backend will archive all node-originated messages into daily log files with roughly 30 days of retention, then expose structured log history and live updates through a new `Anthos.logs` client resource for the Vue log viewer.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.8, Vue 3.5, Node.js 20, Rust for Tauri shell  
**Primary Dependencies**: Express 4.21, Pinia 3, Vue Router 5, `nyx-kit`, SQLite via existing server service layer  
**Storage**: Daily NDJSON log archives on the server, retained for about 30 days  
**Testing**: Vitest, existing frontend/server test setup  
**Target Platform**: Desktop/web client plus Node API server  
**Project Type**: Web application with backend API and shared client library  
**Performance Goals**: Live log visibility within 5 seconds for most messages; historical day lookup within 2 seconds for most requests  
**Constraints**: Bounded frontend session buffer; server retention must not grow without limit  
**Scale/Scope**: Operator-facing log viewer for daily troubleshooting across all nodes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All gates pass.

- Spec-first workflow satisfied: feature already documented in `specs/007-logviewer/spec.md`.
- Documentation as source of truth satisfied: plan and follow-up artifacts live under `specs/007-logviewer/`.
- Test-driven approach supported: plan includes verification points for log history, filters, retention, and viewer state.

## Project Structure

### Documentation (this feature)

```text
specs/007-logviewer/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
server/api/src/
├── routes/
├── controllers/
└── services/

shared/src/anthos/
├── classes/
└── index.ts

app/src/
├── logs/
├── shared/router/
└── dashboard/views/
```

**Structure Decision**: Use the existing web-app split across `server/api`, `shared`, and `app`. The new logs feature will add a dedicated frontend `logs` subdomain, a shared `Anthos.logs` client resource, and server-side log services/routes alongside the existing nodes and telemetry flows.

## Complexity Tracking

No violations.
