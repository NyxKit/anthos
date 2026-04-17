---

description: "Task list for power profiles feature"
---

# Tasks: Power Profiles

**Input**: Design documents from `/specs/011-power-profiles/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; tasks focus on implementation with a small amount of verification where needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared profile definitions and config scaffolding used by all stories

- [X] T001 Create shared power profile types in `shared/src/power-profiles.ts`
- [X] T002 Export power profile types from `shared/src/index.ts`
- [X] T003 [P] Add a central power profile config file in `specs/011-power-profiles/power-profiles.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core plumbing required before any user story can be completed

**Checkpoint**: Profile settings can be stored, retrieved, and applied to a node

- [X] T004 Add node power-profile storage fields to `server/api/src/services/NodeRegistryService.ts`
- [X] T005 Add profile apply/get helpers in `server/api/src/services/NodeRegistryService.ts` for `profileId`, `telemetryIntervalMs`, and `queueIntervalMs`
- [X] T006 [P] Add node-side profile persistence helpers in `node/src/NvsConfig.h` and `node/src/NvsConfig.cpp`
- [X] T007 Add server-assigned and node-applied power profile fields to `shared/src/power-profiles.ts`
- [X] T008 Create `server/api/src/controllers/PowerProfileController.ts` and register it in `server/api/src/routes/createApiRouter.ts`
- [X] T009 Wire node profile application into `node/src/NodeApp.h` and `node/src/NodeApp.cpp`

---

## Phase 3: User Story 1 - Switch node power profile (Priority: P1) 🎯 MVP

**Goal**: Let an operator choose a power profile for a node from the NodeCard and push the cadence values to the node.

**Independent Test**: Select `power saver` or `performance` on a node card and confirm the node receives the profile identity plus both interval values.

- [X] T010 [US1] Implement profile apply endpoint in `server/api/src/controllers/PowerProfileController.ts`
- [X] T011 [P] [US1] Implement profile selection control in `app/src/dashboard/components/NodeCard.vue`
- [X] T012 [US1] Add profile mutation method in `shared/src/anthos/classes/AnthosNodes.ts`
- [X] T013 [US1] Persist applied telemetry and queue intervals on the node in `node/src/NodeApp.cpp`
- [X] T014 [US1] Display the active profile in `app/src/dashboard/components/NodeCard.vue`
- [X] T015 [US1] Add profile selection test coverage in `app/src/dashboard/components/NodeCard.test.ts`

**Checkpoint**: User Story 1 should be independently usable from the NodeCard

---

## Phase 4: User Story 2 - Edit profile cadence values centrally (Priority: P2)

**Goal**: Keep the profile interval values easy to tune from a central config and send the updated values to nodes.

**Independent Test**: Change the config values for one profile and confirm the node receives the updated telemetry and queue intervals when reassigned.

- [X] T016 [P] [US2] Create editable profile config loader in `server/api/src/services/PowerProfileConfigService.ts`
- [X] T017 [US2] Use config values when applying profiles in `server/api/src/controllers/PowerProfileController.ts` so profile updates use editable interval values
- [X] T018 [US2] Store updated profile cadence values in the central `specs/011-power-profiles/power-profiles.json` config used by the server
- [X] T019 [US2] Pass `telemetry_interval_ms` and `queue_interval_ms` from the app to the node in `shared/src/anthos/classes/AnthosNodes.ts`

**Checkpoint**: User Story 2 should allow interval tuning without firmware changes

---

## Phase 5: User Story 3 - Keep the current profile visible on the card (Priority: P3)

**Goal**: Show the active power profile on the card so operators can confirm the node is running the intended cadence.

**Independent Test**: Load a node card after profile assignment and confirm the active profile label matches the applied profile.

- [X] T020 [P] [US3] Render the active profile label in `app/src/dashboard/components/NodeCard.vue`
- [X] T021 [US3] Surface server-assigned and node-applied profile state in `server/api/src/controllers/PowerProfileController.ts` for display on the card
- [X] T022 [US3] Include active profile response types in `shared/src/power-profiles.ts` as needed

**Checkpoint**: User Story 3 should make the active profile visible without extra navigation

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation alignment

- [X] T023 [P] Update `specs/011-power-profiles/quickstart.md` with final UI flow and verification steps
- [X] T024 [P] Update `specs/011-power-profiles/data-model.md` and `specs/011-power-profiles/contracts/power-profiles.md` if final payload names differ
- [X] T025 [P] Add or update tests for profile assignment and display across app/server files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase - no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational phase - may reuse US1 plumbing but remains independently testable
- **User Story 3 (P3)**: Can start after Foundational phase - depends on profile state being stored and retrievable

### Within Each User Story

- Shared types before endpoint/component wiring
- Server helpers before UI integration
- Configuration before profile assignment logic
- Story completion before moving to the next priority

### Parallel Opportunities

- `T001` and `T003` can run in parallel after setup decisions are fixed
- `T006` and `T007` can run in parallel because they touch different layers
- `T010` and `T011` can run in parallel after foundational storage is ready
- `T016` and `T018` can run in parallel during profile config work
- `T020` and `T023` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
Task: "Implement profile apply endpoint in server/api/src/controllers/PowerProfileController.ts"
Task: "Implement profile selection control in app/src/dashboard/components/NodeCard.vue"
Task: "Add profile mutation method in shared/src/anthos/classes/AnthosNodes.ts"
Task: "Persist applied telemetry and queue intervals on the node in node/src/NodeApp.cpp"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the node accepts a profile and the card shows the active profile

### Incremental Delivery

1. Foundation first so profile storage exists
2. Add User Story 1 to make profile switching work end-to-end
3. Add User Story 2 to make profile values configurable
4. Add User Story 3 to keep the active profile visible in the card

### Parallel Team Strategy

1. One developer handles the server profile endpoint and config loader
2. One developer handles the node persistence and runtime application
3. One developer handles NodeCard selection and display
