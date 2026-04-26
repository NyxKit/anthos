# Feature Specification: Node Power Suspend

**Feature Branch**: `[017-node-power-suspend]`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "Node firmware power profile work so hardware stays off unless it is actively needed. In performance mode, the hardware should stay on. In all other modes, it should wake for the scheduled telemetry interval, send the required telemetry, and power off again to save battery life. The node itself should not know about power profile behavior, so define a cutoff threshold for whether it stays awake between intervals."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Always-On Performance Mode (Priority: P1)

As an operator, I want performance mode to keep the node active continuously so the device does not suspend between telemetry cycles.

**Why this priority**: This is the explicit exception to power saving behavior and must remain reliable for always-on use cases.

**Independent Test**: Set the node to performance mode and observe that it does not automatically power down across multiple telemetry intervals.

**Acceptance Scenarios**:

1. **Given** the node is in performance mode, **When** scheduled telemetry intervals occur, **Then** the node remains active before, during, and after telemetry collection.
2. **Given** the node is in performance mode, **When** no other work is pending, **Then** the hardware does not suspend automatically.

---

### User Story 2 - Single Wake Interval (Priority: P2)

As an operator using a non-performance mode, I want the node to wake once per interval, process everything due, and then power off so battery life is preserved.

**Why this priority**: This is the primary battery-saving behavior requested by the roadmap item.

**Independent Test**: Set the node to any non-performance mode and verify that it wakes once per interval, completes telemetry and command work, and powers off again afterward.

**Acceptance Scenarios**:

1. **Given** the node is in a non-performance mode, **When** the interval arrives, **Then** the node wakes, completes telemetry and command processing, and powers off after completion.
2. **Given** the node is in a non-performance mode, **When** the node finishes its active work and the hold window has expired, **Then** it may suspend to save battery.

---

### User Story 3 - Late Queue Grace Period (Priority: P3)

As an operator, I want the node to stay awake briefly after a cycle so a queue action that arrives slightly late is still handled.

**Why this priority**: This prevents wasteful suspend/wake cycles when the next telemetry interval is very near.

**Independent Test**: Set a non-performance mode and verify the node stays awake for the grace window after work completes, then sleeps if no new work arrives.

**Acceptance Scenarios**:

1. **Given** a cycle just completed, **When** the grace window is still open, **Then** the node remains awake.
2. **Given** the grace window has expired and no new work is pending, **When** the node checks again, **Then** it may suspend.

---

### Edge Cases

- The next interval lands exactly on the cutoff threshold.
- A queue item appears during the 10-second grace window.
- The node enters performance mode while it is waiting to suspend.
- Work completes but the device still has not reached the grace window expiry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST keep the node active continuously while performance mode is selected.
- **FR-002**: The system MUST wake the node once per configured interval when a non-performance mode is selected.
- **FR-003**: The system MUST perform telemetry, queue handling, and other required work within that wake cycle.
- **FR-004**: The system MUST keep the node awake for a 10-second grace window after a cycle completes.
- **FR-005**: The system MUST only suspend after the grace window expires and no required work is pending.
- **FR-006**: The system MUST apply the cutoff period only when deciding whether a non-performance mode may suspend after the cycle.
- **FR-007**: The system MUST preserve the single wake interval as the source of truth for regular cadence decisions.
- **FR-008**: The system MUST keep performance mode continuously active.

### Key Entities *(include if feature involves data)*

- **Power Mode**: The selected operating mode that determines whether the node stays continuously active or follows power-saving behavior.
- **Wake Interval**: The single configured cadence that drives telemetry, queue polling, and sensor work.
- **Suspend Cutoff**: The minimum remaining time before the next wake interval that prevents automatic suspension.
- **Grace Window**: A short post-cycle awake period that allows slightly late queue work to still be handled.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a 24-hour test, nodes in performance mode remain continuously active across all scheduled telemetry cycles with zero unexpected suspend events.
- **SC-002**: In a 24-hour test, nodes in non-performance modes wake once per interval and return to sleep after the grace window in at least 95% of cycles.
- **SC-003**: In mixed-mode testing across at least 100 scheduled cycles, required work is completed successfully on schedule for 100% of runs.
- **SC-004**: Queue items that arrive within the 10-second grace window are not missed.

## Assumptions

- The default cutoff threshold is 5 minutes.
- The default grace window is 10 seconds.
- Performance mode is the only always-on mode.
- The single wake interval is the source of truth for regular cadence decisions.
- Required work content and timing remain unchanged; this feature only changes power behavior around the existing schedule.

## Dependencies

- A reliable scheduled telemetry interval must already exist for each node.
- The node must be able to distinguish performance mode from all other operating modes.
