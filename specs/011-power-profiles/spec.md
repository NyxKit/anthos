# Feature Specification: Power Profiles

**Feature Branch**: `[011-power-profiles]`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "i want to create a few power profiles so users can switch between them per node, so it should be shown in the NodeCard

1. power saver - telemetry only pushes once per hour, action queue is checked once per hour
2. balanced - telemetry pushes once per 10min, action queue is checked once per 10min
3. performance - telemetry pushes every minute, action queue is checked once every minute

make sure there is a config somewhere to easily play with these values per profile, i prefer if the app can send this to the node and doesnt have to be hardcoded. the app should send telemetry_interval_ms and queue_interval_ms"

## User Scenarios & Testing *(mandatory)*

## Clarifications

### Session 2026-04-15

- Q: What should the NodeCard treat as the source of truth for the active profile? → A: Server assignment is authoritative; node-applied state is secondary.

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

### User Story 1 - Switch node power profile (Priority: P1)

As an operator, I want to assign a power profile to a node from the NodeCard so I can choose how often it reports telemetry and checks its command queue.

**Why this priority**: The profile choice is the primary user-visible control and determines the node’s operating cadence.

**Independent Test**: Change a node’s profile on the card and confirm the node receives the corresponding interval values.

**Acceptance Scenarios**:

1. **Given** a node is visible in the NodeCard, **When** I select `power saver`, **Then** the node is configured to use the `power saver` intervals.
2. **Given** a node is visible in the NodeCard, **When** I select `performance`, **Then** the node is configured to use the `performance` intervals.

---

### User Story 2 - Edit profile cadence values centrally (Priority: P2)

As an operator, I want the profile cadence values to be easy to adjust in one place so I can tune node behavior without hardcoding them on the node.

**Why this priority**: The profile names are useful only if the underlying intervals can be adjusted without firmware changes.

**Independent Test**: Update a profile’s values and confirm the node receives the new telemetry and queue intervals.

**Acceptance Scenarios**:

1. **Given** the `balanced` profile is configured, **When** I change its cadence values, **Then** future assignments use the updated values.
2. **Given** the app sends profile settings to a node, **When** the node applies them, **Then** the node uses the exact interval values from the profile payload.

---

### User Story 3 - Keep the current profile visible on the card (Priority: P3)

As an operator, I want the NodeCard to show which power profile is active so I can confirm the node is running the intended cadence.

**Why this priority**: The active profile is important context, but it is secondary to assigning and updating it.

**Independent Test**: View a node card after assigning a profile and confirm the server-assigned profile label is visible, even if the node has not yet reported an applied state.

**Acceptance Scenarios**:

1. **Given** a node has a selected profile, **When** the card is shown, **Then** the server-assigned profile name is visible.
2. **Given** a node profile changes, **When** the assignment updates, **Then** the NodeCard reflects the new profile.
3. **Given** the node has not yet applied the assigned profile, **When** the card is shown, **Then** the assigned profile still remains the active label and any applied-state mismatch may be shown separately.

### Edge Cases

- A node receives a profile update while it is offline.
- A node reports a cadence that does not match one of the default profiles.
- The operator changes a profile value after nodes have already been assigned it.
- A profile update partially succeeds and the node only receives one interval.
- A node does not support profile updates yet and must continue with its current cadence.
- The server-assigned profile changes before the node has successfully applied the new cadence.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The system MUST allow a node to be assigned one power profile from the NodeCard.
- **FR-002**: The system MUST provide the following default profile values: `power saver` = `3600000 ms` telemetry and queue intervals, `balanced` = `600000 ms`, `performance` = `60000 ms`.
- **FR-003**: The system MUST allow profile interval values to be adjusted in a central config without hardcoding them on the node.
- **FR-004**: The app MUST send `telemetry_interval_ms` and `queue_interval_ms` to the node when a profile is applied.
- **FR-005**: The node MUST apply the received telemetry interval and queue interval as its operating cadence.
- **FR-006**: The NodeCard MUST display the server-assigned active profile for the node; node-applied state MAY be shown separately when available.
- **FR-007**: The node and API MUST pass only the interval values and profile identity, not hardcoded scheduling logic.
- **FR-008**: If a node cannot accept a profile update, the previous profile MUST remain in effect until a valid update is received.
- **FR-009**: The API MUST expose server-assigned profile state and node-applied profile state as separate fields; telemetry MUST NOT be the source of truth for the active profile.

### Key Entities *(include if feature involves data)*

- **Power Profile**: A named operating mode with telemetry and action-queue intervals.
- **Node Profile Assignment**: The selected profile for a given node.
- **Cadence Values**: The telemetry and queue interval values sent to the node.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Operators can assign a profile to a node and see the profile label update on the card.
- **SC-002**: 100% of assigned nodes receive the exact telemetry and queue interval values configured for their profile.
- **SC-003**: Updating a profile’s cadence values changes the values sent to subsequent nodes without reflashing firmware.
- **SC-004**: The three default profiles remain distinguishable by their interval values and names across all nodes.

## Assumptions

- The app is the source of truth for profile definitions and interval values.
- Nodes can accept updated telemetry and queue intervals at runtime.
- The three default profiles are enough for the initial rollout, but their values should be editable in a central config.

## Dependencies

- A node-side setting mechanism that can apply `telemetry_interval_ms` and `queue_interval_ms`.
- A frontend control in the NodeCard to display and change the active profile.
