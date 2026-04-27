# Feature Specification: Power Telemetry Online Status

**Feature Branch**: `[018-power-telemetry-online]`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "we're gonna make the power management and telemetry co-workflow better integrate and more robust. currently when changing power profile to anything but performance, telemetry stops and the UI shows \"offline\" for that node, while in fact it is hibernating because of the power profile setting. the UI should still show \"online\" unless it missed x amount of telemetry lines when expected according to the power profile. So that means:
- performance has 1s interval - 1s *3 = >3s of no telemetry => offline
- balanced has 10min intervals - 10min *3 = >30min of no telemetry => offline
- power saver has 1hr intervals - 1hr *3 = >3hr of no telemetry => offline

let's plan this feature out in detail - i might have missed or overlooked edge cases or workflows"

## Clarifications

### Session 2026-04-26

- Q: How should offline timing behave when a node changes power profile during a quiet period? → A: Reset the quiet window at the moment the profile changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Keep expected-silence nodes online (Priority: P1)

As an operator, I want nodes in balanced or power saver mode to remain shown as online while they are intentionally quiet, so I do not confuse normal hibernation with a real connectivity failure.

**Why this priority**: This is the core problem the feature must solve and the most visible user-facing improvement.

**Independent Test**: Put a node into balanced or power saver mode and confirm it continues to appear online through normal quiet periods until the expected-silence limit is exceeded.

**Acceptance Scenarios**:

1. **Given** a node is in balanced mode and has recently reported telemetry, **When** less than 30 minutes have passed since the last expected telemetry, **Then** the node remains shown as online.
2. **Given** a node is in power saver mode and has recently reported telemetry, **When** less than 3 hours have passed since the last expected telemetry, **Then** the node remains shown as online.
3. **Given** a node has exceeded its expected-silence limit for the active power profile, **When** no telemetry has arrived, **Then** the node is shown as offline.

---

### User Story 2 - Use profile-specific offline thresholds (Priority: P2)

As an operator, I want offline detection to match the node’s active power profile, so the meaning of online and offline stays consistent across power modes.

**Why this priority**: The offline threshold must change with the profile or the online state will remain misleading.

**Independent Test**: Switch the same node between performance, balanced, and power saver and verify the offline transition time changes with the selected profile.

**Acceptance Scenarios**:

1. **Given** a node is in performance mode, **When** more than 3 seconds pass without telemetry, **Then** it is shown as offline.
2. **Given** a node changes from performance to balanced, **When** the profile change is accepted, **Then** the quiet window resets and the balanced offline threshold applies from that moment.
3. **Given** a node changes from balanced to performance, **When** telemetry is missing for more than 3 seconds, **Then** it is shown as offline even if it was previously allowed a longer quiet period.
4. **Given** a node changes power profile during a quiet period, **When** the profile change is accepted, **Then** the quiet window is reset from the time of that change.

---

### User Story 3 - Recover status on return (Priority: P3)

As an operator, I want a node to return to online as soon as it resumes telemetry, so I can trust the status indicator after a scheduled sleep period or a connectivity gap.

**Why this priority**: Nodes will intentionally sleep, so the status must recover cleanly when expected telemetry resumes.

**Independent Test**: Let a node pass through an expected quiet window, then verify that the next telemetry event restores the node to online.

**Acceptance Scenarios**:

1. **Given** a node is shown as offline because it exceeded its expected-silence limit, **When** telemetry resumes, **Then** the node returns to online.
2. **Given** a node is shown as online during an expected quiet window, **When** telemetry arrives on schedule, **Then** it stays online.

### Edge Cases

- A node changes power profile while it is in a quiet period.
- A node resumes telemetry exactly at the profile threshold boundary.
- A node has not yet reported telemetry after a profile change.
- A node remains quiet for longer than the threshold because of a real fault, not an intentional sleep cycle.
- A node comes back online after a long quiet period and should recover immediately on the first new telemetry event.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST keep a node shown as online while it remains within the allowed quiet period for its active power profile.
- **FR-002**: The system MUST mark a node as offline only after it has missed at least three expected telemetry intervals for its active power profile.
- **FR-003**: The system MUST use a 3-second quiet limit for performance mode, a 30-minute quiet limit for balanced mode, and a 3-hour quiet limit for power saver mode.
- **FR-004**: The system MUST reset the quiet window from the moment a node’s power profile changes.
- **FR-005**: The system MUST return a node to online as soon as telemetry is received after an offline state.
- **FR-006**: The system MUST not treat intentional hibernation under a non-performance profile as an offline condition while the node remains within its expected quiet period.

### Key Entities *(include if feature involves data)*

- **Power Profile**: The selected operating mode for a node, which determines its expected telemetry interval.
- **Telemetry Interval**: The normal time between telemetry reports for a given profile.
- **Expected Quiet Limit**: The maximum allowed silence before a node is considered offline.
- **Node Status**: The visible online/offline state shown to operators.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In testing across all three power profiles, nodes remain shown as online for the full expected quiet limit and only change to offline after that limit is exceeded.
- **SC-002**: In a test set of at least 30 profile changes, the visible node status updates to match the new profile’s quiet limit without showing a false offline state.
- **SC-003**: In a recovery test of at least 20 offline events, nodes return to online on the first telemetry received after the quiet period ends.
- **SC-004**: In a validation session with 10 operators, at least 8 correctly classify 4 out of 5 sample node states as online or offline based on the node’s active power profile and elapsed silence.

## Assumptions

- The active power profile is the source of truth for how long a node may be silent before being considered offline.
- Every managed node has an active power profile.
- A node records the time its active power profile was last assigned, and that timestamp starts the quiet window after a profile change.
- The three profiles and their expected telemetry intervals are fixed for this feature: performance at 1 second, balanced at 10 minutes, and power saver at 1 hour.
- A node is expected to generate telemetry again after its normal quiet period ends unless a real failure occurs.
- Nodes may be intentionally quiet during non-performance modes and should not be penalized for that behavior.

## Dependencies

- Reliable knowledge of each node’s active power profile.
- Telemetry timestamps accurate enough to compare elapsed silence against the expected quiet limit.
- Existing node status views that can reflect online and offline changes without requiring a new status category.
