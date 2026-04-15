# Feature Specification: Battery Status Indicator (Blocked)

**Feature Branch**: `[010-battery-status]`  
**Created**: 2026-04-14  
**Status**: Blocked by hardware  
**Input**: User description: "i want the interface (NodeCard) to show a battery in the top-right corder of the card that represents the battery status using icons (with on-hover tooltip that shows exact percentage)

icons:
- \"battery-warning\": 0-15%
- \"battery-low\": 15-40
- \"battery-medium\": 40-70
- \"battery-high\": 70-100
- \"battery-charging\": when charging
- \"plug-zap\": when done charging, but still powered through an external source (other than the tailbat)

make sure these cutoffs are defined on the frontend level, the node and the api should only pass the absolute values (how much battery in % and whether or not on external power vs tailbat)

if some things are not possible using a tailbat, let me know"

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

### User Story 1 - Show battery status on node cards (Priority: P1)

As an operator, I want each `NodeCard` to show battery status in the top-right corner so I can quickly see whether a node is running low.

**Why this priority**: Battery visibility is the core user-facing value of the feature and is useful on its own.

**Independent Test**: Provide a node with a battery percentage and confirm the card shows the expected battery icon and exact percentage tooltip.

**Acceptance Scenarios**:

1. **Given** a node reports 10% battery, **When** the card is shown, **Then** the battery warning icon appears and the tooltip shows `10%`.
2. **Given** a node reports 82% battery, **When** the card is shown, **Then** the battery high icon appears and the tooltip shows `82%`.

---

### User Story 2 - Reflect charging and external power state (Priority: P2)

As an operator, I want the battery icon to reflect charging and external power state so I can tell whether a node is plugged in or actively charging.

**Why this priority**: Charging and external power are important context for interpreting battery percentage.

**Independent Test**: Provide nodes with charging and external-power states and confirm the correct icon is chosen without changing the cutoff rules.

**Acceptance Scenarios**:

1. **Given** a node is charging, **When** the card is shown, **Then** the charging icon is displayed.
2. **Given** a node is on external power and not charging, **When** the card is shown, **Then** the plug icon is displayed.

---

### User Story 3 - Handle unsupported battery telemetry (Priority: P3)

As an operator, I want nodes without battery telemetry to fail gracefully so the interface does not pretend to know their power state.

**Why this priority**: Not every power accessory exposes the same data, especially simpler battery add-ons.

**Independent Test**: Provide a node without battery telemetry and confirm the UI shows no misleading battery state.

**Acceptance Scenarios**:

1. **Given** a node does not report battery state, **When** the card is shown, **Then** the battery indicator is hidden or shown as unknown without a misleading percentage.
2. **Given** a node reports battery data later, **When** the next update arrives, **Then** the battery indicator appears without reloading the page.

### Edge Cases

- A node reports a battery percentage but no charging state.
- A node reports charging state without external power status.
- Battery percentage is exactly on a cutoff boundary, such as `15%` or `40%`.
- A TailBat-powered node cannot expose battery telemetry at all, in which case the feature should not be considered available for that hardware.
- Battery telemetry becomes temporarily stale or unavailable.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The interface MUST show a battery indicator in the top-right corner of each node card when battery data is available.
- **FR-002**: The interface MUST choose the battery icon from the displayed percentage using these frontend-defined cutoffs: `0-15%` warning, `15-40%` low, `40-70%` medium, `70-100%` high.
- **FR-003**: The interface MUST show a charging icon when a node reports that it is charging.
- **FR-004**: The interface MUST show a plug icon when a node reports external power without charging.
- **FR-005**: The interface MUST show the exact battery percentage in an on-hover tooltip.
- **FR-006**: The node and API MUST pass only the raw battery percentage and power-state flags, not icon names or cutoff logic.
- **FR-007**: The interface MUST not display a misleading battery status when a node cannot provide battery telemetry.
- **FR-008**: Battery states MUST update when fresh node data arrives without requiring a full page refresh.
- **FR-009**: If the connected hardware cannot provide battery telemetry, the feature MUST degrade to a non-battery state rather than displaying an invented percentage.

### Key Entities *(include if feature involves data)*

- **Battery Status**: The node-reported battery percentage and power-state flags used to render the card icon and tooltip.
- **Power State**: Whether the node is charging, externally powered, or running from the TailBat/battery.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% of nodes that report battery data show a battery indicator in the card view without opening node details.
- **SC-002**: The same battery percentage always maps to the same icon across all node cards.
- **SC-003**: Hovering a battery icon reveals the exact percentage for 100% of nodes that report battery data.
- **SC-004**: 0 nodes without battery telemetry display a fake battery percentage.

## Assumptions

- Frontend owns the icon cutoffs and maps icon names to percentage ranges.
- TailBat alone may not expose detailed battery telemetry; nodes using only TailBat may be unable to report percentage or charging state.
- Nodes and the API will provide raw battery percentage plus simple power-state flags when available.
- If TailBat cannot provide battery telemetry, this feature is blocked for the current node setup.

## Dependencies

- A node-side source of battery percentage and power-state flags where hardware supports them.
- A frontend icon set that includes battery and plug status icons.
- Spare hardware pins or a separate battery telemetry path that does not conflict with Earth/Watering unit wiring.
