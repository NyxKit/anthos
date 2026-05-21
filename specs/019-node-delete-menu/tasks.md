---

description: "Task list for Node Actions Menu"
---

# Tasks: Node Actions Menu

**Input**: Design documents from `/specs/019-node-delete-menu/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared client and store plumbing for node deletion.

- [X] T001 [P] Add `deleteLogicalNode(nodeId: string)` to `shared/src/anthos/classes/AnthosNodes.ts` so the app can call the new node removal endpoint.
- [X] T002 Add a delete wrapper in `app/src/nodes/stores/nodes.ts` that calls the new client method and removes the deleted node from local state after success.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the API-side delete behavior before the UI relies on it.

**⚠️ CRITICAL**: No delete user story should be considered complete until the logical-node delete path exists on the API.

- [X] T003 [P] Implement `deleteLogicalNode(nodeId: string)` in `server/api/src/services/NodeRegistryService.ts` to remove only the logical node row and keep `hardware_nodes` intact.
- [X] T004 Register `DELETE /api/nodes/:id` in `server/api/src/routes/createApiRouter.ts` and add the authenticated handler in `server/api/src/controllers/ProvisionController.ts` with 204, 404, 401, and 403 responses.

**Checkpoint**: The API can delete a logical node without breaking hardware re-registration.

---

## Phase 3: User Story 1 - Access Node Actions (Priority: P1) 🎯 MVP

**Goal**: Replace the standalone edit button with an always-available three-dot node actions menu.

**Independent Test**: Open a node card for an online node and an offline node and confirm both show the same enabled actions menu with edit available.

- [X] T005 [US1] Replace the standalone edit pencil in `app/src/dashboard/components/NodeCardActions.vue` with a vertical three-dot dropdown trigger that stays enabled when `isLiveNode` is false.
- [X] T006 [US1] Move the existing edit action into the dropdown in `app/src/dashboard/components/NodeCardActions.vue` and keep the edit modal flow unchanged.

**Checkpoint**: User Story 1 should now be visible and usable on its own.

---

## Phase 4: User Story 2 - Delete a Node Safely (Priority: P1)

**Goal**: Let operators delete a node from the new menu after a warning that the hardware still needs a manual reset.

**Independent Test**: Open the node actions menu, choose delete, confirm the warning mentions the manual reset requirement, and verify the node disappears after confirmation.

- [X] T007 [US2] Add the delete action item, confirmation modal, and manual-reset warning copy in `app/src/dashboard/components/NodeCardActions.vue`.
- [X] T008 [US2] Hook the delete action through `app/src/nodes/stores/nodes.ts` so confirmed deletion removes the node from the visible list after a successful API response.

**Checkpoint**: User Story 2 should now work independently of any later recovery work.

---

## Phase 5: User Story 3 - Recover After Deletion (Priority: P2)

**Goal**: Keep the existing safe behavior where a deleted node can reappear automatically if the hardware was not manually reset.

**Independent Test**: Delete a node, do not manually reset the hardware, then have the same device report again and verify it can be recognized and shown again as active.

- [X] T009 [US3] Document the deleted-node recovery path in `specs/019-node-delete-menu/quickstart.md` with a manual-reset check and a report-again verification step.
- [X] T010 [P] [US3] Update `specs/019-node-delete-menu/contracts/nodes-api.md` to state that delete removes only the logical node and leaves hardware tracking available for later re-registration.

**Checkpoint**: User Story 3 is documented and the recovery behavior is explicit.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final wording and consistency cleanup across the feature docs and UI.

- [X] T011 [P] Tidy any remaining node-delete copy in `specs/019-node-delete-menu/plan.md`, `specs/019-node-delete-menu/data-model.md`, and `app/src/dashboard/components/NodeCardActions.vue` so the warning and recovery story read consistently.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2); no dependency on later stories.
- **User Story 2 (P1)**: Can start after Foundational (Phase 2); builds on the same node card component as US1.
- **User Story 3 (P2)**: Can start after User Story 2; validates the post-delete recovery path that delete makes possible.

### Within Each User Story

- Shared client/store plumbing before UI wiring.
- API behavior before delete UI relies on it.
- Menu trigger before menu actions and confirmation flow.
- Document the recovery path after the delete flow exists.

### Parallel Opportunities

- T001 and T003 can run in parallel because they touch different layers and files.
- T010 and T011 can run in parallel because they update different files.

---

## Parallel Example: User Story 3

```bash
Task: "Update `specs/019-node-delete-menu/contracts/nodes-api.md` to state that delete removes only the logical node and leaves hardware tracking available for later re-registration."
Task: "Tidy any remaining node-delete copy in `specs/019-node-delete-menu/plan.md`, `specs/019-node-delete-menu/data-model.md`, and `app/src/dashboard/components/NodeCardActions.vue` so the warning and recovery story read consistently."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Confirm the new three-dot menu appears for both online and offline nodes.

### Incremental Delivery

1. Land shared client/store plumbing.
2. Add the API delete endpoint and logical-node delete behavior.
3. Replace the edit button with the always-available node actions menu.
4. Add the delete action and warning flow.
5. Document the recovery path and manual-reset expectation.
6. Clean up the copy so the feature reads consistently end to end.

### Parallel Team Strategy

With multiple developers:

1. One developer handles `shared/src/anthos/classes/AnthosNodes.ts` and `app/src/nodes/stores/nodes.ts`.
2. Another developer handles `server/api/src/services/NodeRegistryService.ts` and `server/api/src/controllers/ProvisionController.ts`.
3. Another developer handles `app/src/dashboard/components/NodeCardActions.vue`.
4. A final developer updates the feature docs in `specs/019-node-delete-menu/`.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks, cross-story coupling, and hidden dependencies
