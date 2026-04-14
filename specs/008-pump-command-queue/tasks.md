---

description: "Task list for pump command queue feature"
---

# Tasks: Pump Command Queue

**Input**: Design documents from `/specs/008-pump-command-queue/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature; tasks focus on implementation and validation docs.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared types and scaffolding needed before command flow work begins

- [x] T001 Create shared command queue types in `shared/src/commands.ts`
- [x] T002 Export command queue types from `shared/src/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that must exist before any user story can be completed

**Checkpoint**: Command storage, service access, and node/client scaffolding are ready

- [x] T003 Add command queue tables and supporting indexes to `server/api/src/services/TelemetryService.ts`
- [x] T004 Create `server/api/src/services/CommandQueueService.ts` with enqueue, fetch, and acknowledgement helpers
- [x] T005 Create `server/api/src/controllers/CommandController.ts` and register command routes in `server/api/src/routes/createApiRouter.ts`
- [x] T006 Create `node/src/CommandClient.h` and `node/src/CommandClient.cpp` scaffolding for polling and acknowledgements
- [x] T007 Create `node/src/PumpActuator.h` and `node/src/PumpActuator.cpp` scaffolding and wire them into `node/src/NodeApp.h` and `node/src/NodeApp.cpp`

---

## Phase 3: User Story 1 - Retrieve and run pump commands (Priority: P1) 🎯 MVP

**Goal**: Let a node poll for queued pump commands and execute them without waiting for telemetry.

**Independent Test**: Queue a pump command for a node, wait for the next poll cycle, and confirm the node executes the pump action even if telemetry is delayed.

- [x] T008 [US1] Implement command validation and durable persistence in `server/api/src/services/CommandQueueService.ts`
- [x] T009 [US1] Implement the command enqueue endpoint in `server/api/src/controllers/CommandController.ts`
- [x] T010 [US1] Implement the pending command retrieval endpoint in `server/api/src/controllers/CommandController.ts`
- [x] T011 [P] [US1] Implement node command polling and payload parsing in `node/src/CommandClient.cpp`
- [x] T012 [US1] Implement pump activation and stop timing in `node/src/PumpActuator.cpp`
- [x] T013 [US1] Dispatch retrieved pump commands from `node/src/NodeApp.cpp` to `node/src/CommandClient.cpp` and `node/src/PumpActuator.cpp`

**Checkpoint**: User Story 1 should be independently functional and demonstrable

---

## Phase 4: User Story 2 - Confirm command handling (Priority: P2)

**Goal**: Record whether a pump command completed successfully or failed, and keep the queue from re-running finished commands.

**Independent Test**: Execute a pump command, acknowledge the result, and confirm the command is no longer returned as pending.

- [x] T014 [US2] Implement command status transitions and duplicate acknowledgement protection in `server/api/src/services/CommandQueueService.ts`
- [x] T015 [P] [US2] Implement the acknowledgement endpoint in `server/api/src/controllers/CommandController.ts`
- [x] T016 [P] [US2] Report command execution success and failure from `node/src/CommandClient.cpp`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Operate independently of telemetry cadence (Priority: P3)

**Goal**: Keep command polling reliable even when telemetry is intentionally infrequent.

**Independent Test**: Increase telemetry reporting to a very low rate, queue a pump command, and confirm the node still retrieves it on the command polling cycle.

- [x] T017 [P] [US3] Add dedicated command poll interval settings in `node/src/AppConfig.h` and `node/src/AppConfig.cpp`
- [x] T018 [US3] Separate command polling from telemetry sending in `node/src/ApiClient.cpp` and `node/src/NodeApp.cpp`
- [x] T019 [US3] Update `specs/008-pump-command-queue/quickstart.md` with low-telemetry validation steps

**Checkpoint**: Telemetry cadence should no longer affect command delivery

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final alignment across docs and shared definitions

- [x] T020 [P] Update `specs/008-pump-command-queue/contracts/commands.md` to match the final command and acknowledgement payloads
- [x] T021 [P] Refresh `specs/008-pump-command-queue/data-model.md` and `shared/src/index.ts` if final implementation names differ

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase - no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational phase - may extend User Story 1 behavior but remains independently testable
- **User Story 3 (P3)**: Can start after Foundational phase - focuses on polling cadence and telemetry independence

### Within Each User Story

- Service logic before route/controller wiring
- Polling and actuator scaffolding before node dispatch
- Story-specific implementation before cross-cutting polish

### Parallel Opportunities

- `T009` and `T010` can run in parallel after `T008`
- `T011` and `T012` can run in parallel after foundational scaffolding
- `T015` and `T016` can run in parallel after `T014`
- `T017` and `T019` can run in parallel with other story work once node behavior is stable
- `T020` and `T021` can run in parallel during polish

---

## Parallel Example: User Story 1

```bash
Task: "Implement the command enqueue endpoint in server/api/src/controllers/CommandController.ts"
Task: "Implement the pending command retrieval endpoint in server/api/src/controllers/CommandController.ts"
Task: "Implement node command polling and payload parsing in node/src/CommandClient.cpp"
Task: "Implement pump activation and stop timing in node/src/PumpActuator.cpp"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the node can retrieve and execute a pump command without telemetry timing

### Incremental Delivery

1. Foundation first so the queue exists
2. Add User Story 1 to make pump triggering work end-to-end
3. Add User Story 2 to make command results durable and idempotent
4. Add User Story 3 to ensure long telemetry intervals do not affect command delivery

### Parallel Team Strategy

1. One developer handles the server queue service and routes
2. One developer handles node polling and pump actuation
3. One developer handles telemetry-decoupling and documentation cleanup
