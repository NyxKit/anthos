---

description: "Task list for Power Telemetry Online Status"
---

# Tasks: Power Telemetry Online Status

**Input**: Design documents from `/specs/018-power-telemetry-online/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Included because this feature depends on TDD-style verification of shared status behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the shared node status model for profile-aware timing

- [X] T001 [P] Add `powerProfileAssignedAt` to `shared/src/nodes/types/plantNode.ts` and load it in `shared/src/nodes/classes/PlantNode.ts` with a `0` default
- [X] T002 [P] Expose `power_profile_assigned_at` from `server/api/src/services/NodeRegistryService.ts` in `rowToRecord()` so the client can reset quiet timing on profile change

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared regression coverage that must be in place before story-specific behavior is finalized

**⚠️ CRITICAL**: No user story work should be considered complete until this phase has failing coverage that is then made to pass

- [X] T003 [P] Add a regression case in `app/src/shared/utils/telemetry-threshold.test.ts` for the existing 3x offline threshold across performance, balanced, and power saver profiles
- [X] T004 [P] Add a regression case in `app/src/dashboard/components/NodeCard.test.ts` for the Online label staying visible while a balanced-profile node remains inside its expected quiet window

**Checkpoint**: Shared status timing is now covered by failing tests and prepared for implementation

---

## Phase 3: User Story 1 - Keep expected-silence nodes online (Priority: P1) 🎯 MVP

**Goal**: Nodes in balanced or power saver mode stay shown as online while they are intentionally quiet

**Independent Test**: A node with a recent telemetry timestamp remains Online during its expected quiet window and only becomes Offline after the profile-specific limit is exceeded

### Implementation for User Story 1

- [X] T005 [US1] Update `shared/src/nodes/classes/PlantNode.ts` to compute Connected vs Offline from the later of the last telemetry timestamp and `powerProfileAssignedAt`
- [X] T006 [P] [US1] Update `app/src/dashboard/components/NodeCard.test.ts` to assert a balanced or power saver node stays Online during intentional silence and flips to Offline only after the threshold is exceeded

**Checkpoint**: User Story 1 should now be fully functional and independently demonstrable

---

## Phase 4: User Story 2 - Use profile-specific offline thresholds (Priority: P2)

**Goal**: Offline timing matches the node’s active power profile, including immediate threshold changes when the profile changes

**Independent Test**: Switch a node between performance, balanced, and power saver and confirm the offline threshold changes immediately with the active profile

### Implementation for User Story 2

- [X] T007 [US2] Extend `app/src/shared/utils/telemetry-threshold.test.ts` with exact assertions for 3 seconds, 30 minutes, and 3 hours across the three profiles
- [X] T008 [US2] Add a regression case in `app/src/shared/utils/telemetry-threshold.test.ts` proving a profile change restarts the quiet window immediately when switching from balanced to performance

**Checkpoint**: User Story 2 should now be independently testable without relying on later work

---

## Phase 5: User Story 3 - Recover status on return (Priority: P3)

**Goal**: A node returns to Online as soon as telemetry resumes after being offline

**Independent Test**: Let a node exceed its quiet limit, then send telemetry again and confirm the status returns to Online on the first new reading

### Implementation for User Story 3

- [X] T009 [P] [US3] Add a regression case in `app/src/dashboard/components/NodeCard.test.ts` for returning to Online on the first telemetry event after an offline period
- [X] T010 [US3] Confirm `shared/src/nodes/classes/PlantNode.ts` returns Connected again as soon as telemetry resumes after an Offline state

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across the feature

- [X] T011 [P] Update `specs/018-power-telemetry-online/quickstart.md` with the final verification flow for performance, balanced, and power saver modes
- [X] T012 Run the focused Vitest suites for `app/src/shared/utils/telemetry-threshold.test.ts` and `app/src/dashboard/components/NodeCard.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks user-story validation
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - no dependency on later stories
- **User Story 2 (P2)**: Can start after Phase 2 - uses the same shared timing model as US1
- **User Story 3 (P3)**: Can start after Phase 2 - depends on the same shared status model but not on a separate API change

### Within Each User Story

- Tests (if included) should be written before the matching implementation task where practical
- Shared type/model updates before logic that consumes them
- Shared logic before UI assertions
- Story complete before moving to the next priority

### Parallel Opportunities

- T001 and T002 can run in parallel because they touch different files
- T003 and T004 can run in parallel because they are separate regression tests
- T006 can be worked on in parallel with other UI-only verification tasks after T005 lands
- T007 and T009 can run in parallel because they cover different test files and story concerns
- T011 and T012 can run in parallel with any final non-conflicting cleanup

---

## Parallel Example: User Story 1

```bash
Task: "Update app/src/dashboard/components/NodeCard.test.ts to assert a balanced or power saver node stays Online during intentional silence"
Task: "Update shared/src/nodes/classes/PlantNode.ts to compute Connected vs Offline from the later of the last telemetry timestamp and powerProfileAssignedAt"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm balanced and power saver nodes stay Online through expected quiet windows

### Incremental Delivery

1. Foundation ready → shared model supports profile-aware timing
2. Add User Story 1 → intentional quiet no longer looks like downtime
3. Add User Story 2 → profile thresholds remain correct across all modes
4. Add User Story 3 → offline nodes recover cleanly on the first new telemetry
5. Polish and validate the quickstart flow

### Parallel Team Strategy

With multiple developers:

1. One developer handles shared type plumbing in `shared/src/nodes/types/plantNode.ts` and `shared/src/nodes/classes/PlantNode.ts`
2. Another developer updates `server/api/src/services/NodeRegistryService.ts`
3. Another developer prepares regression coverage in `app/src/shared/utils/telemetry-threshold.test.ts` and `app/src/dashboard/components/NodeCard.test.ts`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks, cross-story coupling, and hidden dependencies
