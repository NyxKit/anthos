# Tasks: Telemetry Dashboard

**Input**: Design documents from `/specs/001-telemetry-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create frontend/ directory structure per plan.md
- [x] T002 Initialize Vue 3 project with package.json (nyx-kit, vue, vue-router, pinia, vite)
- [x] T003 [P] Configure vite.config.ts, tsconfig.json, index.html
- [x] T004 [P] Configure SCSS and nyx-kit style imports in src/main.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 Setup Vue Router in frontend/src/shared/router/index.ts
- [x] T006 Create Pinia store in frontend/src/dashboard/stores/telemetry.ts
- [x] T007 [P] Define TypeScript types in frontend/src/shared/types/telemetry.ts
- [x] T008 [P] Setup API client in frontend/src/dashboard/api/readings.ts
- [x] T009 Create App.vue and main.ts entry point with nyx-kit initialization

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Node Telemetry (Priority: P1) 🎯 MVP

**Goal**: Display single node and all sensor unit values on dashboard load

**Independent Test**: Load dashboard and verify node card with all sensor values displays

### Implementation for User Story 1

- [x] T010 [P] [US1] Create DashboardView in frontend/src/dashboard/views/DashboardView.vue
- [x] T011 [P] [US1] Create NodeCard component in frontend/src/dashboard/components/NodeCard.vue
- [x] T012 [P] [US1] Create SensorList component in frontend/src/dashboard/components/SensorList.vue
- [x] T013 [US1] Connect Pinia store to API polling (5-second refresh)
- [x] T014 [US1] Add auto-refresh logic using setInterval in store

**Checkpoint**: At this point, User Story 1 should be fully functional

---

## Phase 4: User Story 2 - View Unit Details (Priority: P2)

**Goal**: Each sensor shows name, value, and unit of measurement

**Independent Test**: Verify each sensor displays with unit label

### Implementation for User Story 2

- [x] T015 [P] [US2] Create SensorItem component in frontend/src/dashboard/components/SensorItem.vue
- [x] T016 [US2] Update SensorList to render SensorItem for each reading
- [x] T017 [US2] Handle sensor value updates preserving unit labels

**Checkpoint**: User Stories 1 AND 2 should work independently

---

## Phase 5: User Story 3 - View Node Health (Priority: P3)

**Goal**: Show node connection status (connected/disconnected)

**Independent Test**: Verify node status indicator on dashboard

### Implementation for User Story 3

- [x] T018 [P] [US3] Create StatusIndicator component in frontend/src/dashboard/components/StatusIndicator.vue
- [x] T019 [US3] Add connection status to Node entity and API response
- [x] T020 [US3] Implement disconnection detection (30s timeout)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases and improvements

- [x] T021 [P] Implement empty state ("Waiting for data...") in NodeCard
- [x] T022 Handle missing/invalid sensor values (display "N/A")
- [x] T023 [P] Add error state with retry option for API failures
- [ ] T024 Run lint and validate build works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - MVP
- **User Story 2 (P2)**: Can start after Foundational, integrates with US1
- **User Story 3 (P3)**: Can start after Foundational, integrates with US1

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- T010, T011, T012 can run in parallel
- T015, T016 can run in parallel
- T018, T019 can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Deploy (MVP!)
3. Add User Story 2 → Test → Deploy
4. Add User Story 3 → Test → Deploy

---

## Summary

- **Total Tasks**: 24
- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1)**: 5 tasks
- **Phase 4 (US2)**: 3 tasks
- **Phase 5 (US3)**: 3 tasks
- **Phase 6 (Polish)**: 4 tasks

- **Parallel Opportunities**: 9 tasks marked [P]
- **Independent Test Criteria**: Each user story can be tested independently after its phase completes
