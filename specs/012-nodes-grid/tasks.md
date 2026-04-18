# Tasks: Nodes Grid

**Input**: Design documents from `/specs/012-nodes-grid/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the shared nodes UI surface for reuse

- [X] T001 Create the reusable nodes grid component file at `app/src/nodes/components/NodesGrid.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared behavior needed before any page-specific wiring

**Checkpoint**: Shared grid behavior is available for both dashboard and nodes page

- [X] T002 Implement store-backed claimed-node selection and optional limit handling in `app/src/nodes/components/NodesGrid.vue`
- [X] T003 Add the shared empty-state and node-card rendering logic in `app/src/nodes/components/NodesGrid.vue`

---

## Phase 3: User Story 1 - Compact dashboard summary (Priority: P1) 🎯 MVP

**Goal**: Show a compact claimed-node summary on the dashboard using the shared grid.

**Independent Test**: Open the dashboard and confirm the shared grid shows only the compact subset of claimed nodes.

### Implementation for User Story 1

- [X] T004 [US1] Replace the inline dashboard node list in `app/src/dashboard/views/DashboardView.vue` with `NodesGrid` and pass the compact limit
- [X] T005 [US1] Verify the dashboard still renders the empty state in `app/src/dashboard/views/DashboardView.vue` when no claimed nodes exist

**Checkpoint**: Dashboard summary is fully powered by the shared grid.

---

## Phase 4: User Story 2 - Full nodes management view (Priority: P1)

**Goal**: Reuse the same grid on the nodes page to show the full claimed-node list.

**Independent Test**: Open the nodes page and confirm all claimed nodes appear in the shared grid without a limit.

### Implementation for User Story 2

- [X] T006 [US2] Replace the claimed-node grid block in `app/src/nodes/views/NodesView.vue` with `NodesGrid`
- [X] T007 [US2] Keep the unclaimed-node section in `app/src/nodes/views/NodesView.vue` wired to the existing claim modal flow
- [X] T008 [US2] Update `app/src/nodes/views/NodesView.vue` layout so the shared grid and claim section remain visually distinct

**Checkpoint**: Nodes page shows the full claimed-node grid and still supports claiming.

---

## Phase 5: User Story 3 - Claim nodes from the nodes page (Priority: P2)

**Goal**: Preserve the existing claim flow so unclaimed nodes can move into the claimed grid after being named.

**Independent Test**: Claim an unclaimed node from the nodes page and confirm it appears in the shared claimed-node grid after refresh.

### Implementation for User Story 3

- [X] T009 [US3] Keep `app/src/nodes/components/ClaimNodeModal.vue` connected to the nodes store claim action and refresh path
- [X] T010 [P] [US3] Ensure `app/src/nodes/stores/nodes.ts` still refreshes node state after a successful claim so `NodesGrid` sees the updated claimed set

**Checkpoint**: Claiming a node updates the shared grid-visible claimed list.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup across both pages

- [X] T011 [P] Remove any dead dashboard-only node list logic in `app/src/dashboard/views/DashboardView.vue`
- [X] T012 [P] Remove any dead claimed-node grid markup from `app/src/nodes/views/NodesView.vue`
- [X] T013 Update shared node-grid usage notes if needed in `specs/012-nodes-grid/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all story work
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P1)**: Can start after Foundational (Phase 2)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2); relies on the claim flow already present in the nodes page

### Within Each User Story

- Shared grid foundation before page-specific wiring
- Page wiring before cleanup
- Story complete before moving to the next priority

### Parallel Opportunities

- T010 can run in parallel with T009
- T011 and T012 can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
Task: "Replace the inline dashboard node list in `app/src/dashboard/views/DashboardView.vue` with `NodesGrid` and pass the compact limit"
Task: "Verify the dashboard still renders the empty state in `app/src/dashboard/views/DashboardView.vue` when no claimed nodes exist"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the dashboard uses the shared grid correctly

### Incremental Delivery

1. Build the shared grid foundation
2. Swap the dashboard to the shared grid
3. Swap the nodes page claimed-node area to the shared grid
4. Preserve the claim flow and clean up dead layout code

### Parallel Team Strategy

With multiple developers:

1. One developer builds `NodesGrid`
2. One developer wires the dashboard
3. One developer wires the nodes page and claim flow
4. Final pass removes duplicated layout code

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
