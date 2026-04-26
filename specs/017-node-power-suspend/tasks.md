# Tasks: Node Power Suspend

**Input**: Design documents from `/specs/017-node-power-suspend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare a dedicated power-policy module and expose the cutoff and grace rules in the firmware layer.

- [x] T001 [P] Create `node/src/PowerPolicy.h` with the suspend decision API and 5-minute cutoff constant
- [x] T002 [P] Create `node/src/PowerPolicy.cpp` with the initial power-mode and cutoff decision helpers

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared power lifecycle hooks that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add power lifecycle state handling to `node/src/NodeApp.h` and `node/src/NodeApp.cpp` so the main loop can coordinate active and suspended windows
- [x] T004 [P] Add shutdown and re-enable hooks to `node/src/SensorManager.h` and `node/src/SensorManager.cpp` for explicit hardware power control
- [x] T005 [P] Expose the cutoff duration through `node/src/NvsConfig.h` and `node/src/NvsConfig.cpp` as the single source of truth for suspend decisions

**Checkpoint**: The firmware can now reason about when suspension is allowed, but no story-specific behavior is enabled yet.

---

## Phase 3: User Story 1 - Always-On Performance Mode (Priority: P1) 🎯 MVP

**Goal**: Keep the node active continuously whenever performance mode is selected.

**Independent Test**: Set performance mode and confirm the device does not automatically suspend across multiple telemetry intervals.

- [x] T006 [P] [US1] Wire performance mode into `node/src/NodeApp.cpp` so the active window never closes automatically
- [x] T007 [US1] Enforce the always-on rule in `node/src/PowerPolicy.cpp` so performance mode cannot be scheduled for suspension

**Checkpoint**: Performance mode behaves as a fully always-on operating mode.

---

## Phase 4: User Story 2 - Power Save Between Intervals (Priority: P2)

**Goal**: Wake once per interval in non-performance modes, process work, then power down again.

**Independent Test**: Set any non-performance mode and confirm the node wakes once, completes telemetry and queue work, and powers off afterward.

- [x] T008 [P] [US2] Implement the wake-send-power-off flow in `node/src/NodeApp.cpp` for non-performance modes
- [x] T009 [P] [US2] Add the active-window teardown path in `node/src/ApiClient.cpp`, `node/src/CommandClient.cpp`, and `node/src/SensorManager.cpp` so telemetry and queue work finish before suspension

**Checkpoint**: Non-performance modes now use the battery-saving cycle around each telemetry interval.

---

## Phase 5: User Story 3 - Short-Interval Grace Period (Priority: P3)

**Goal**: Keep the node awake briefly after a cycle so slightly late queue work is still handled.

**Independent Test**: Configure any non-performance mode and confirm the hardware stays awake for 10 seconds after a cycle before sleeping.

- [x] T010 [P] [US3] Compare the next wake interval against the 5-minute cutoff in `node/src/PowerPolicy.cpp` and `node/src/NvsConfig.cpp`
- [x] T011 [US3] Preserve the awake state for the 10-second grace window in `node/src/NodeApp.cpp` before suspension

**Checkpoint**: Short intervals stay awake and avoid unnecessary suspend/wake churn.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation cleanup across all stories.

- [x] T012 [P] Update `specs/017-node-power-suspend/quickstart.md` with the final power-mode validation steps and cutoff behavior notes
- [x] T013 Validate the firmware build and on-device suspend behavior from `node/`, then record any follow-up notes in `specs/017-node-power-suspend/research.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 - blocks all user stories.
- **Phase 3+ (User Stories)**: Depend on Phase 2.
- **Phase 6 (Polish)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - no dependency on later stories.
- **User Story 2 (P2)**: Can start after Phase 2 - may reuse User Story 1 wiring, but remains independently testable.
- **User Story 3 (P3)**: Can start after Phase 2 - depends on the shared cutoff rule, not on later story behavior.

### Within Each User Story

- Shared helpers before behavior wiring.
- Orchestrator changes before lifecycle cleanup.
- Power transition logic before validation.

### Parallel Opportunities

- `T001` and `T002` can run in parallel.
- `T004` and `T005` can run in parallel after `T003` defines the orchestration shape.
- `T006` and `T007` can run in parallel once Phase 2 is complete.
- `T008` and `T009` can run in parallel once the active-window hooks exist.
- `T010` and `T011` can run in parallel once the cutoff rule is wired.

---

## Parallel Example: User Story 1

```bash
Task: "Wire performance mode into node/src/NodeApp.cpp so the active window never closes automatically"
Task: "Enforce the always-on rule in node/src/PowerPolicy.cpp so performance mode cannot be scheduled for suspension"
```

---

## Parallel Example: User Story 2

```bash
Task: "Implement the wake-send-power-off flow in node/src/NodeApp.cpp for non-performance modes"
Task: "Add the active-window teardown path in node/src/ApiClient.cpp and node/src/SensorManager.cpp so telemetry finishes before suspension"
```

---

## Parallel Example: User Story 3

```bash
Task: "Compare the next telemetry interval against the 5-minute cutoff in node/src/PowerPolicy.cpp and node/src/NvsConfig.cpp"
Task: "Preserve the awake state between closely spaced telemetry runs in node/src/NodeApp.cpp when the cutoff blocks suspension"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate performance mode stays active across multiple telemetry intervals.
5. Demo or ship the always-on behavior before moving to power-saving work.

### Incremental Delivery

1. Deliver always-on performance mode first.
2. Add wake-send-power-off behavior for all other modes.
3. Add the short-interval cutoff grace period last.
4. Finish with quickstart and hardware validation updates.

### Parallel Team Strategy

1. One engineer can own `PowerPolicy` while another updates `NodeApp`.
2. After the foundation lands, separate workstreams can handle performance mode, power-saving mode, and cutoff behavior.
3. Finish with a shared validation pass on real hardware.
