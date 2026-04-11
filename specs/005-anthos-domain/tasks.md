# Tasks: Anthos Domain Layer

**Input**: Design documents from `/specs/005-anthos-domain/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared Anthos domain boundary and supporting types

- [x] T001 [P] Create the Anthos domain folder structure in `shared/src/anthos/` with a public entry file at `shared/src/anthos/index.ts`
- [x] T002 [P] Add shared Anthos setup and connection-state types in `shared/src/anthos/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Anthos foundation that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement the `Anthos` base class with internal setup state and node subdomain wiring in `shared/src/anthos/classes/Anthos.ts`
- [x] T004 [P] Wire the shared Anthos singleton export from `shared/src/anthos/index.ts` and re-export it from `shared/src/index.ts`

**Checkpoint**: The shared Anthos boundary exists and can be imported as one singleton entry point

---

## Phase 3: User Story 1 - Centralized Node Access (Priority: P1) 🎯 MVP

**Goal**: Move node and telemetry access behind the shared Anthos domain so stores stop calling backend routes directly

**Independent Test**: The nodes view and dashboard can load and refresh current node data through `anthos.nodes` without any direct backend calls from stores

### Implementation for User Story 1

- [x] T005 [P] [US1] Implement node and telemetry access methods in `shared/src/anthos/classes/AnthosNodes.ts`
- [x] T006 [US1] Refactor node listing, node claiming, and provisioning-window actions in `app/src/nodes/stores/nodes.ts` to use `anthos.nodes`
- [x] T007 [US1] Refactor dashboard telemetry loading in `app/src/dashboard/stores/telemetry.ts` to use `anthos.nodes` and keep only store state shaping there
- [x] T008 [US1] Remove the obsolete direct telemetry helper in `app/src/dashboard/api/readings.ts` and update any remaining imports

**Checkpoint**: User Story 1 is independently usable and all migrated node flows go through Anthos

---

## Phase 4: User Story 2 - Delayed Setup Readiness (Priority: P2)

**Goal**: Allow Anthos to be created before connection details are known and configured later without rebuilding the app

**Independent Test**: The app can start with an unconfigured Anthos instance and later apply setup data successfully in the same session

### Implementation for User Story 2

- [x] T009 [P] [US2] Extend `Anthos.setup()` behavior in `shared/src/anthos/classes/Anthos.ts` so later setup calls replace stored connection state cleanly
- [x] T010 [US2] Update app startup in `app/src/main.ts` to import the shared Anthos singleton early and apply setup data when available before the UI mounts

**Checkpoint**: Anthos can be created immediately and configured later without restarting the app

---

## Phase 5: User Story 3 - Future Domain Foundation (Priority: P3)

**Goal**: Reserve room, alert, and user entry points in the shared Anthos layer without changing current behavior

**Independent Test**: The Anthos singleton exposes inert rooms, alerts, and users access points while current node flows continue to work

### Implementation for User Story 3

- [x] T011 [P] [US3] Create empty scaffold classes for rooms, alerts, and users in `shared/src/anthos/classes/AnthosRooms.ts`, `shared/src/anthos/classes/AnthosAlerts.ts`, and `shared/src/anthos/classes/AnthosUsers.ts`
- [x] T012 [US3] Wire the future-domain instances into `shared/src/anthos/classes/Anthos.ts` and export them from `shared/src/anthos/index.ts`

**Checkpoint**: Future Anthos domains are reserved and isolated from current node behavior

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup that spans multiple user stories

- [x] T013 [P] Clean up shared-domain documentation and stale backend-access references in `specs/005-anthos-domain/quickstart.md`, `app/src/dashboard/api/readings.ts`, and any store comments that still describe direct API calls

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on later stories
- **User Story 2 (P2)**: Can start after Foundational - may use US1 wiring but remains independently testable
- **User Story 3 (P3)**: Can start after Foundational - must not alter US1 behavior

### Within Each User Story

- Core domain classes before store migration
- Store migration before helper removal
- Setup behavior before bootstrap wiring
- Future scaffolds before export wiring

### Parallel Opportunities

- `T001` and `T002` can run in parallel during setup
- `T004` can run alongside `T003` once the base class shape is agreed
- `T005` can be developed in parallel with `T010` if the Anthos base contract is stable
- `T011` can run in parallel with `T012` once the scaffold class names are fixed

---

## Parallel Example: User Story 1

```bash
Task: "Implement node and telemetry access methods in shared/src/anthos/classes/AnthosNodes.ts"
Task: "Refactor node listing, node claiming, and provisioning-window actions in app/src/nodes/stores/nodes.ts to use anthos.nodes"
Task: "Refactor dashboard telemetry loading in app/src/dashboard/stores/telemetry.ts to use anthos.nodes and keep only store state shaping there"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate node and telemetry flows through Anthos only

### Incremental Delivery

1. Setup and foundation establish the shared Anthos boundary
2. User Story 1 moves current backend calls behind Anthos and delivers the MVP
3. User Story 2 adds delayed setup readiness and early app bootstrap
4. User Story 3 reserves the future shared domains without changing current behavior

### Parallel Team Strategy

With multiple developers:

1. One developer can own shared Anthos foundation while another prepares store migration
2. After foundation, US1 and US2 can proceed in parallel if the Anthos base contract is stable
3. US3 can be completed independently once the base Anthos shape is settled
