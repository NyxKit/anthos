# Feature Specification: Pump Command Queue

**Feature Branch**: `[008-pump-command-queue]`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "implement the functionality to trigger a pump, do not do it on telemetry however since i will increase the interval dramatically. Use your second proposal (the command queue): GET /api/nodes/:nodeId/commands, node calls it on a short interval, server returns pending commands, node executes and acks them"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Retrieve and run pump commands (Priority: P1)

As an operator, I want a node to check for queued pump commands on a short interval so I can trigger watering without waiting for telemetry.

**Why this priority**: This is the core value of the feature: remote pump control that is independent of telemetry frequency.

**Independent Test**: Queue a pump command for a node, wait for the next poll cycle, and confirm the node activates the pump without requiring any telemetry event.

**Acceptance Scenarios**:

1. **Given** a node with a valid identity and one pending pump command, **When** it checks for commands, **Then** it receives the command and starts the pump action.
2. **Given** a node with no pending commands, **When** it checks for commands, **Then** it receives an empty result and does not activate the pump.

---

### User Story 2 - Confirm command handling (Priority: P2)

As an operator, I want command delivery to be acknowledged so I can tell whether a pump request was accepted, completed, or failed.

**Why this priority**: Reliable acknowledgement is required to avoid duplicate watering and to make command status visible.

**Independent Test**: Queue a command, observe the acknowledgement after execution, and verify the command is no longer pending.

**Acceptance Scenarios**:

1. **Given** a node executes a pump command successfully, **When** it acknowledges the command, **Then** the command is marked complete and is not delivered again.
2. **Given** a node cannot complete a pump command, **When** it acknowledges the failure, **Then** the command status records the failure for review.

---

### User Story 3 - Operate independently of telemetry cadence (Priority: P3)

As an operator, I want pump command delivery to continue even when telemetry is infrequent so that watering can be controlled on its own schedule.

**Why this priority**: The feature must still work when telemetry is intentionally slowed down.

**Independent Test**: Increase telemetry interval to a very low reporting rate, queue a pump command, and confirm it is still delivered on the command polling cycle.

**Acceptance Scenarios**:

1. **Given** telemetry is delayed or infrequent, **When** a pump command is queued, **Then** the node still retrieves and processes the command on its own polling schedule.

---

### User Story 4 - Mark node hardware capability (Priority: P3)

As an operator, I want to mark a named node as `earth` or `watering` so the server only offers pump commands to nodes that can safely run them.

**Why this priority**: Capability determines whether pump commands are valid, and it must be editable without touching firmware.

**Independent Test**: Change a node from `earth` to `watering` on the named nodes page, then confirm the server starts allowing pump commands for that node.

**Acceptance Scenarios**:

1. **Given** a claimed node, **When** its capability is updated to `watering`, **Then** the server marks it as pump-capable and allows pump commands.
2. **Given** a claimed node, **When** its capability is `earth`, **Then** the server rejects pump commands for that node.
3. **Given** a node capability changes on the server, **When** the node next polls for commands, **Then** it learns the updated capability without reflashing.

### Edge Cases

- A node is offline when a command is queued and receives it later when it reconnects.
- Multiple pump commands are queued for the same node before the next poll.
- A command is delivered more than once because of a retry and must not run twice after acknowledgement.
- The pump fails during activation and the node reports the failure instead of pretending success.
- A node polls for commands while telemetry is disabled or heavily delayed.
- A claimed node can switch between `earth` and `watering` from the named nodes page only.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST allow a node to request pending commands for its node identity on a regular short interval that is independent of telemetry delivery.
- **FR-002**: The system MUST return zero or more pending commands for a node, including pump commands that can be executed by the node.
- **FR-003**: The system MUST ensure that a pending command is not removed from visibility until the node acknowledges it.
- **FR-004**: The node MUST execute a pump command when it receives one and MUST report whether the command completed successfully or failed.
- **FR-005**: The system MUST prevent the same pump command from being executed twice after a successful acknowledgement.
- **FR-006**: The system MUST retain the current status of each command so operators can distinguish pending, completed, and failed commands.
- **FR-007**: The node MUST continue command polling even when telemetry is slowed down, paused, or otherwise infrequent.
- **FR-008**: The system MUST associate each command with exactly one target node.
- **FR-009**: The system MUST store a capability for each claimed node and only allow pump commands for nodes marked `watering`.
- **FR-010**: The system MUST expose node capability changes through the named nodes management flow.

### Key Entities *(include if feature involves data)*

- **Node**: A physical device that polls for commands and executes pump actions.
- **Command**: A queued instruction for a specific node, including its type, current status, and execution outcome.
- **Command Acknowledgement**: The node’s confirmation that a command was completed or failed.
- **Node Capability**: A server-assigned node attribute indicating whether the node is `earth`-only or supports the watering pump.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Operators can queue a pump command and see it delivered to the target node on the next polling cycle in at least 95% of normal cases.
- **SC-002**: Pump commands remain deliverable even when telemetry is reduced to a very infrequent schedule.
- **SC-003**: At least 99% of successfully executed pump commands are acknowledged exactly once and do not run again.
- **SC-004**: Operators can determine whether a command is pending, completed, or failed for every queued pump request.
- **SC-005**: Operators can switch a named node between `earth` and `watering` from the nodes management screen, and the change takes effect without reflashing the node.

## Assumptions

- Pump commands are short-lived actions that activate the pump for a defined run.
- The test pump action uses a 5-second default duration unless the operator chooses a different duration.
- Pending commands remain available until the node acknowledges them.

## Dependencies

- A reachable server endpoint for command retrieval and acknowledgement.
- A pump-capable node wired with the appropriate output control.
