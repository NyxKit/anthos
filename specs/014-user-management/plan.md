# Implementation Plan: User Management

**Branch**: `014-user-management` | **Date**: 2026-04-18 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/014-user-management/spec.md`
**Input**: Feature specification from `/specs/014-user-management/spec.md`

## Summary

Add a users management area to the app with authentication/session management, a tabular user list, admin-only creation flow, and first-run setup that creates the initial administrator when the users table is empty. Shared user logic will live under `shared/src/users`, and the frontend will use a shared Anthos wrapper for `anthos.users.login` and `anthos.users.register`.

## Technical Context

**Language/Version**: TypeScript 5.8, Vue 3.5, Rust (Tauri v2 shell), Node.js 20  
**Primary Dependencies**: Express 4.21, sql.js 1.14, Pinia 3, Vue Router 5, nyx-kit, Vitest  
**Storage**: SQLite via sql.js in `server/api`, persisted to the existing Anthos DB file  
**Testing**: Vitest for API and app code  
**Target Platform**: Desktop app shell backed by a local Node API service  
**Project Type**: Monorepo desktop app + API service  
**Performance Goals**: Users page should load and show the current user list within a normal app-startup flow  
**Constraints**: First-run setup is determined only by absence of user rows; role assignment must be enforced at the server boundary; auth/session management must be part of this feature; SQL must remain readable and multiline  
**Scale/Scope**: Small internal admin surface for a single Anthos installation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pass. The feature is specified before implementation, keeps the source of truth in `specs/`, uses shared string enums for cross-module role values, and preserves readable multiline SQL.

## Project Structure

### Documentation (this feature)

```text
specs/014-user-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
server/api/src/      # Express API, SQLite schema, auth, and user management endpoints
shared/src/          # Shared Anthos contracts, enums, and user models
shared/src/users/    # Shared user domain model and helpers
shared/src/anthos/classes/   # Anthos API wrappers, including anthos.users
app/src/             # Vue/Tauri app routes, views, auth, and admin UI
specs/014-user-management/
└── contracts/       # User-facing API contract docs for this feature
```

**Structure Decision**: Use the existing monorepo layout and add user management across `server/api`, `shared`, and `app` so authentication, setup, and admin-only user creation stay consistent end to end.

## Complexity Tracking

None.
