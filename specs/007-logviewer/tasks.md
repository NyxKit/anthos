---

description: "Task list for Log Viewer feature"
---

# Tasks: Log Viewer

**Input**: Design documents from `/specs/007-logviewer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included, because you requested tests as part of task generation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the shared log types that the backend, shared client, and frontend will use.

- [x] T001 Create shared log entry and archive types in `shared/src/logs.ts`
- [x] T002 Export the new log types from `shared/src/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core log infrastructure that must exist before any user story can be completed.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 [P] Add the `Anthos.logs` client wrapper in `shared/src/anthos/classes/AnthosLogs.ts`
- [x] T004 Update `shared/src/anthos/classes/Anthos.ts` and `shared/src/anthos/index.ts` to instantiate and export `Anthos.logs`
- [x] T005 [P] Create the server log archive service scaffold in `server/api/src/services/LogArchiveService.ts`
- [x] T006 [P] Create the logs controller and register `/api/logs` routes in `server/api/src/controllers/LogsController.ts` and `server/api/src/routes/createApiRouter.ts`
- [x] T007 [P] Scaffold the frontend logs subdomain in `app/src/logs/stores/logs.ts`, `app/src/logs/views/LogsView.vue`, and `app/src/shared/router/index.ts`

**Checkpoint**: The shared model, API surface, server service, and frontend route/store scaffold are in place.

---

## Phase 3: User Story 1 - Live Log Stream (Priority: P1) 🎯 MVP

**Goal**: Operators can open the log viewer and see new node messages appear live.

**Independent Test**: Open the logs view, generate a node message, and confirm it appears without a page reload.

### Tests for User Story 1

- [x] T008 [P] [US1] Add contract and integration coverage for live log streaming in `server/api/tests/logs.live.test.ts`
- [x] T009 [P] [US1] Add store coverage for live append behavior and bounded buffering in `app/src/logs/stores/logs.test.ts`

### Implementation for User Story 1

- [x] T010 [P] [US1] Implement live log append and stream delivery in `server/api/src/controllers/LogsController.ts` and `server/api/src/services/LogArchiveService.ts`
- [x] T011 [P] [US1] Implement live log subscription methods in `shared/src/anthos/classes/AnthosLogs.ts`
- [x] T012 [US1] Wire live feed state and bounded session buffering into `app/src/logs/stores/logs.ts`
- [x] T013 [US1] Build the live log viewer UI in `app/src/logs/views/LogsView.vue` using `NyxLogViewer`

**Checkpoint**: Live logs can be viewed in the new logs area without reloading the app.

---

## Phase 4: User Story 2 - Historical Log Browsing (Priority: P2)

**Goal**: Operators can browse previous days and filter stored logs for troubleshooting.

**Independent Test**: Select an older day, apply filters, and confirm the viewer shows the expected subset of entries.

### Tests for User Story 2

- [x] T014 [P] [US2] Add contract coverage for history pagination and filters in `server/api/tests/logs.history.test.ts`
- [x] T015 [P] [US2] Add view coverage for browsing and filter interactions in `app/src/logs/views/LogsView.test.ts`

### Implementation for User Story 2

- [x] T016 [P] [US2] Implement log history listing and cursor pagination in `server/api/src/controllers/LogsController.ts` and `server/api/src/services/LogArchiveService.ts`
- [x] T017 [P] [US2] Add history query methods and filter-aware list calls in `shared/src/anthos/classes/AnthosLogs.ts`
- [x] T018 [US2] Expand `app/src/logs/stores/logs.ts` with date, source, severity, and cursor state
- [x] T019 [US2] Add the historical browsing controls and filter UI in `app/src/logs/views/LogsView.vue`

**Checkpoint**: Historical browsing works independently of the live stream.

---

## Phase 5: User Story 3 - Automatic Retention and Organization (Priority: P3)

**Goal**: Log archives stay organized by day and old logs are removed after the retention window.

**Independent Test**: Advance the archive date past the retention window and confirm expired logs are no longer served.

### Tests for User Story 3

- [x] T020 [P] [US3] Add retention coverage for archive rotation and cleanup in `server/api/tests/logs.retention.test.ts`
- [x] T021 [P] [US3] Add unavailable and expired-state coverage in `app/src/logs/stores/logs.retention.test.ts`

### Implementation for User Story 3

- [x] T022 [P] [US3] Implement daily archive rotation and 30-day cleanup in `server/api/src/services/LogArchiveService.ts`
- [x] T023 [US3] Hook retention startup checks and periodic cleanup into `server/api/src/server.ts`
- [x] T024 [US3] Surface expired and unavailable archive states in `app/src/logs/stores/logs.ts` and `app/src/logs/views/LogsView.vue`

**Checkpoint**: Log storage stays bounded and expired archives are handled cleanly in the UI.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish integration points and align supporting docs with the completed feature.

- [x] T025 [P] Update `app/src/dashboard/components/SidebarNav.vue` and `app/src/dashboard/views/ActivityLog.vue` to route users to the new logs area
- [x] T026 [P] Update `specs/007-logviewer/quickstart.md` with the final validation steps for live logs, history, and retention

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all selected user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - no dependency on other stories
- **User Story 2 (P2)**: Can start after Phase 2 - reuses the same log model and service
- **User Story 3 (P3)**: Can start after Phase 2 - retention is independent of viewer behavior

### Within Each User Story

- Shared model/client work before feature-specific wiring
- Server service behavior before frontend wiring
- Story complete before moving to the next priority

### Parallel Opportunities

- `T003`, `T005`, `T006`, and `T007` can run in parallel once `T001` and `T002` are complete
- `T008` and `T009` can run in parallel once the foundational phase is complete
- `T010` and `T011` can run in parallel once the tests for US1 are complete
- `T014` and `T015` can run in parallel once the US1 implementation is complete
- `T016` and `T017` can run in parallel once the US2 tests are complete
- `T020` and `T021` can run in parallel once the US3 implementation is complete

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the logs view with live node messages
5. Demo or ship the live viewer as the first increment

### Incremental Delivery

1. Deliver live log streaming first
2. Add historical browsing and filters next
3. Finish with retention and archive cleanup
4. Keep each increment usable on its own

### Parallel Team Strategy

With multiple developers:

1. One developer completes shared types and Anthos client wiring
2. One developer builds the server log service and routes
3. One developer starts the frontend logs store and view scaffold
4. After the foundation is done, the live stream, history, and retention stories can proceed in parallel
