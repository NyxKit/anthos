---

description: "Task list for Automations feature"
---

# Tasks: Automations

**Input**: Design documents from `/specs/015-automation-rules/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared feature scaffolding

- [X] T001 [P] Create shared automation enum and type scaffolding in `shared/src/automations.ts` and export it from `shared/src/index.ts` and `shared/src/anthos/types/index.ts`
- [X] T002 [P] Scaffold the automations feature structure in `app/src/automations/` and add `RouteName.Automations` to `app/src/shared/types/router.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add automation storage tables and indexes to `server/api/src/services/TelemetryService.ts`
- [X] T004 Implement automation persistence and validation in `server/api/src/services/AutomationService.ts`
- [X] T005 Implement automation trigger evaluation in `server/api/src/services/AutomationEvaluator.ts`
- [X] T006 Add automation controller endpoints and wire them into `server/api/src/controllers/AutomationController.ts` and `server/api/src/routes/createApiRouter.ts`
- [X] T007 Add the shared Anthos automation client in `shared/src/anthos/classes/AnthosAutomations.ts` and register it in `shared/src/anthos/classes/Anthos.ts` and `shared/src/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create an automation (Priority: P1) 🎯 MVP

**Goal**: Operators can create a watering automation from a modal and see it appear in the automations table.

**Independent Test**: Open the automations page, create a valid watering automation, and confirm the new row appears without leaving the page.

- [X] T008 [P] [US1] Add the automations route and sidebar navigation entry in `app/src/shared/router/index.ts` and `app/src/dashboard/components/SidebarNav.vue`
- [X] T009 [P] [US1] Build the automations store for list loading, node selection, and create-modal state in `app/src/automations/stores/automations.ts`
- [X] T010 [P] [US1] Create the automations page shell with `NyxTable` and the row actions slot in `app/src/automations/views/AutomationsView.vue`
- [X] T011 [P] [US1] Build the `NyxForm` modal for node, sensor, operator, threshold, and dynamic `command` input in `app/src/automations/components/AutomationForm.vue`
- [X] T012 [US1] Wire the create, save, and cancel flow to `shared/src/anthos/classes/AnthosAutomations.ts` from `app/src/automations/views/AutomationsView.vue` and `app/src/automations/stores/automations.ts`

**Checkpoint**: User Story 1 should now be fully functional and testable independently

---

## Phase 4: User Story 2 - Review and manage automations (Priority: P2)

**Goal**: Operators can edit or delete existing automations from the same table.

**Independent Test**: Open an existing automation, edit it, confirm the table updates, then delete it and confirm it disappears.

- [X] T013 [P] [US2] Extend the automations store with edit-state, delete-state, and refresh handling in `app/src/automations/stores/automations.ts`
- [X] T014 [P] [US2] Reuse the automation form for edit mode and populated row editing in `app/src/automations/views/AutomationsView.vue` and `app/src/automations/components/AutomationForm.vue`
- [X] T015 [P] [US2] Add delete confirmation and table removal behavior in `app/src/automations/views/AutomationsView.vue`
- [X] T016 [US2] Connect update and delete operations to `shared/src/anthos/classes/AnthosAutomations.ts` and keep the table in sync in `app/src/automations/stores/automations.ts`

**Checkpoint**: User Story 2 should now work independently.

---

## Phase 5: User Story 3 - Trigger automations automatically (Priority: P2)

**Goal**: Matching sensor readings automatically enqueue the configured watering command and respect cooldown suppression.

**Independent Test**: Send a reading that crosses the threshold, verify a watering command is queued and logged, then send another matching reading within 30 minutes and verify no duplicate trigger fires.

- [X] T017 [P] [US3] Evaluate incoming sensor readings against stored automations in `server/api/src/controllers/IngestController.ts` and `server/api/src/services/AutomationEvaluator.ts`
- [X] T018 [P] [US3] Queue watering commands for matching automations and persist `lastTriggeredAt` in `server/api/src/services/AutomationEvaluator.ts` and `server/api/src/services/CommandQueueService.ts`
- [X] T019 [P] [US3] Record automation trigger logs and lifecycle logs in `server/api/src/services/AutomationService.ts` and `server/api/src/services/LogArchiveService.ts`
- [X] T020 [US3] Enforce the 30-minute suppression window and validate the dynamic `command` payload shape in `server/api/src/services/AutomationService.ts` and `server/api/src/services/AutomationEvaluator.ts`

**Checkpoint**: User Story 3 should now be independently functional and auditable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T021 [P] Update `specs/015-automation-rules/contracts/automations-api.md` and `specs/015-automation-rules/quickstart.md` to match the implemented `commandType` and `command` field names
- [X] T022 Validate the end-to-end automation flow against `specs/015-automation-rules/quickstart.md` and clean up shared exports in `shared/src/index.ts`
- [ ] T023 [P] Validate automation evaluation latency and ingest continuity against `specs/015-automation-rules/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May reuse User Story 1 UI components but remains independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on the persisted automation model and command queue path

### Within Each User Story

- Shared client and service changes before UI wiring
- Store state before view composition
- Form composition before page wiring
- Story complete before moving to the next priority

### Parallel Opportunities

- Setup tasks `T001` and `T002` can run in parallel
- Foundational tasks `T003` through `T007` can run in parallel across different files
- User Story 1 tasks `T008` through `T011` can run in parallel before the final wiring task `T012`
- User Story 2 tasks `T013` through `T015` can run in parallel before the sync task `T016`
- User Story 3 tasks `T017` through `T019` can run in parallel before the suppression/validation task `T020`

---

## Parallel Example: User Story 1

```bash
# Launch these in parallel after the foundation is ready:
Task: "Add the automations route and sidebar navigation entry in app/src/shared/router/index.ts and app/src/dashboard/components/SidebarNav.vue"
Task: "Build the automations store for list loading, node selection, and create-modal state in app/src/automations/stores/automations.ts"
Task: "Create the automations page shell with NyxTable and the row actions slot in app/src/automations/views/AutomationsView.vue"
Task: "Build the NyxForm modal for node, sensor, operator, threshold, and dynamic command input in app/src/automations/components/AutomationForm.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm the create/save/cancel flow and table refresh independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → automation plumbing ready
2. Add User Story 1 → create flow works
3. Add User Story 2 → edit/delete management works
4. Add User Story 3 → automatic triggering and logging works
5. Finish with Polish tasks and quickstart validation

### Parallel Team Strategy

1. Team completes Setup and Foundational tasks together
2. Once the foundation is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Merge and validate after each story checkpoint

---

## Notes

- `[P]` tasks can run in parallel when they touch different files and have no unfinished dependencies
- `[Story]` labels map each task to a specific user story for traceability
- Keep each story independently demonstrable before moving on
- Preserve the existing command queue model and canonical enum naming
