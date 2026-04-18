# Tasks: Remove Node Claiming

**Input**: Design documents from `/specs/013-remove-node-claiming/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Contract Cleanup)

**Purpose**: Remove claim concepts from the shared node contract surface first.

- [X] T001 [P] Remove claim status and claim-state defaults from `shared/src/nodes/types/plantNode.ts` and `shared/src/nodes/classes/PlantNode.ts`
- [X] T002 [P] Remove the claim client method from `shared/src/anthos/classes/AnthosNodes.ts` and keep only claim-free node actions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove claim-backed API and firmware behavior before story-specific UI cleanup begins.

**⚠️ CRITICAL**: No user story work should depend on claim state after this phase.

- [X] T003 [P] Drop `claim_status` from `server/api/src/services/TelemetryService.ts` schema defaults and legacy logical-node handling
- [X] T004 [P] Refactor `server/api/src/services/NodeRegistryService.ts` to stop reading, writing, and checking claim state in node records
- [X] T005 [P] Remove claim route registration and claim handler entry points from `server/api/src/routes/createApiRouter.ts` and `server/api/src/controllers/ProvisionController.ts`
- [X] T006 [P] Remove claim-gated rejection paths from `server/api/src/controllers/PowerProfileController.ts` so node actions work on the simplified model
- [X] T007 [P] Remove any claim-specific firmware traces in `node/src/NodeApp.cpp`, `node/src/ProvisioningManager.cpp`, `node/src/HubClient.cpp`, `node/src/HubClient.h`, `node/src/NvsConfig.cpp`, and `node/src/NvsConfig.h`

**Checkpoint**: The data model, API, and firmware no longer depend on claim state.

---

## Phase 3: User Story 1 - Show Nodes Immediately (Priority: P1) 🎯 MVP

**Goal**: Show every node directly in the main list as soon as it is available.

**Independent Test**: Register a node and confirm it appears in the main list without any claim or naming flow.

- [X] T008 [P] [US1] Update `app/src/nodes/views/NodesView.vue` and `app/src/nodes/components/NodesGrid.vue` to render one unified node list with no unclaimed section or claim modal entry points
- [X] T009 [P] [US1] Update `app/src/dashboard/components/NodeCard.vue` to display nodes with the simplified label fallback and no claim-state branches

**Checkpoint**: User Story 1 should now be visible and usable on its own.

---

## Phase 4: User Story 2 - Manage Nodes Directly (Priority: P2)

**Goal**: Allow users to edit node details and configuration directly from the node without any claim step.

**Independent Test**: Rename a node or change its settings and confirm the update saves without claim-related UI or gating.

- [X] T010 [P] [US2] Update `app/src/nodes/components/NodeCardActions.vue` to keep rename and configuration actions available directly on a node
- [X] T011 [US2] Update `app/src/nodes/stores/nodes.ts` to call the claim-free node update methods and refresh the list after direct edits

**Checkpoint**: User Story 2 should now work without any claim workflow.

---

## Phase 5: User Story 3 - Remove Claiming UI and Language (Priority: P3)

**Goal**: Eliminate claim-specific components, labels, and dead ends from the UI.

**Independent Test**: Navigate the node screens and confirm there are no claim prompts, claim buttons, or unclaimed/claimed sections.

- [X] T012 [P] [US3] Delete `app/src/nodes/components/UnclaimedNodeCard.vue` and `app/src/nodes/components/ClaimNodeModal.vue`
- [X] T013 [US3] Remove claim-specific state, labels, and empty sections from `app/src/nodes/views/NodesView.vue`
- [X] T014 [US3] Remove unclaimed/claimed filtering and related claim terminology from `app/src/nodes/stores/nodes.ts`

**Checkpoint**: All user-facing claim terminology should now be gone.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish cleanup across tests, docs, and contract references.

- [X] T015 [P] Remove residual claim terminology from `app/src/dashboard/components/NodeCard.test.ts` and `app/src/shared/utils/telemetry-threshold.test.ts`
- [X] T016 [P] Align `specs/013-remove-node-claiming/contracts/nodes-api.md` and `specs/013-remove-node-claiming/quickstart.md` with the final claim-free node contract

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on the story phases being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2); no dependency on later stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2); should stay usable even if UI cleanup is still pending.
- **User Story 3 (P3)**: Can start after Foundational (Phase 2); primarily removes legacy surfaces after the simplified flow is in place.

### Within Each User Story

- Claim-free shared/API/firmware cleanup must land before UI story work.
- Direct node actions should be updated before deleting the old claim UI components.
- Remove claim terminology only after the new unified node flow exists.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T003 through T007 can run in parallel if the files are edited carefully.
- T008 and T009 can run in parallel.
- T010 and T011 can run in parallel.
- T012 can run alongside T013 and T014 once the shared cleanup is complete.
- T015 and T016 can run in parallel after the UI and contract changes settle.

---

## Parallel Example: User Story 1

```bash
Task: "Update `app/src/nodes/views/NodesView.vue` and `app/src/nodes/components/NodesGrid.vue` to render one unified node list with no unclaimed section or claim modal entry points"
Task: "Update `app/src/dashboard/components/NodeCard.vue` to display nodes with the simplified label fallback and no claim-state branches"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate the node list shows directly without claim flow.

### Incremental Delivery

1. Land shared contract cleanup.
2. Remove claim-backed API and firmware behavior.
3. Show nodes immediately in the main UI.
4. Enable direct node management.
5. Remove the old claim-specific UI surfaces.
6. Clean up tests and docs.

### Parallel Team Strategy

1. One developer can handle shared contract cleanup.
2. Another can remove API and firmware claim traces.
3. UI work can then split between the main node list, direct actions, and legacy component removal.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story should remain independently completable and testable
