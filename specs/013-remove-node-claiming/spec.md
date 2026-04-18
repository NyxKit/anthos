# Feature Specification: Remove Node Claiming

**Feature Branch**: `[013-remove-node-claiming]`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "given the prior communication, we'll need to phase out \"claiming\", just render the node as it comes \"on\". get rid of all ties and dead ends, cleanup so nothing regarding claiming remains"

## Clarifications

### Session 2026-04-18

- Q: Should claim-related traces be removed from firmware and API too? → A: Remove claim-related state, endpoints, and contracts entirely; migrate existing nodes to the simplified model.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Show Nodes Immediately (Priority: P1)

As a user, I want newly available nodes to appear in the main node list right away so I can start using them without a separate setup step.

**Why this priority**: This is the core behavior change. If nodes still require a separate approval step, the feature does not deliver its intended value.

**Independent Test**: Add a new node and verify it appears in the primary node list without any claim or naming flow.

**Acceptance Scenarios**:

1. **Given** a node has been registered, **When** the node list is displayed, **Then** the node appears in the main list without needing any additional action.
2. **Given** a node has no user-defined name, **When** the node list is displayed, **Then** the node is still visible using a stable default label.

---

### User Story 2 - Manage Nodes Directly (Priority: P2)

As a user, I want to edit a node’s label and settings directly from the node itself so I do not have to pass through a separate claim workflow first.

**Why this priority**: Users still need a way to personalize and configure nodes, but the flow should be direct and free of claim-related detours.

**Independent Test**: Open a node, change its label or settings, and confirm the updated values are saved and reflected immediately.

**Acceptance Scenarios**:

1. **Given** a node is visible in the list, **When** the user edits its label, **Then** the new label is saved and shown in the node list.
2. **Given** a node is visible in the list, **When** the user changes a configurable node setting, **Then** the change applies without any claim step.

---

### User Story 3 - Remove Claiming UI and Language (Priority: P3)

As a user, I want the product to stop showing claim-related language and dead-end actions so the interface matches the simplified node model.

**Why this priority**: Once the main flow is simplified, the remaining work is to eliminate confusing legacy surfaces and keep the experience consistent.

**Independent Test**: Navigate the node-related screens and confirm there are no claim prompts, claim buttons, or unclaimed/claimed sections.

**Acceptance Scenarios**:

1. **Given** I open the node management screens, **When** I review the available actions and labels, **Then** no claim terminology is shown.
2. **Given** there are no nodes yet, **When** the empty state is shown, **Then** it uses neutral node language rather than claim-related language.

---

### Edge Cases

- A node arrives without a user-defined name.
- A node was previously shown with claim-related state and must still appear after the update.
- A node becomes temporarily unavailable after it has already appeared in the list.
- There are no nodes at all, so the empty state must still make sense without claim terminology.
- Existing records created under the older model must still load after migration without requiring claim-specific state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST show every available node in the primary node list without requiring a claim action.
- **FR-002**: The system MUST display a stable fallback label for any node that does not have a user-defined name.
- **FR-003**: The system MUST allow users to rename a node directly from its node details or list entry.
- **FR-004**: The system MUST allow node configuration actions to be performed without any claim prerequisite.
- **FR-005**: The system MUST present a single, unified node experience instead of separate claimed and unclaimed sections.
- **FR-006**: The system MUST remove claim-related prompts, labels, and actions from user-facing node screens.
- **FR-007**: The system MUST continue to show previously registered nodes after the update, even if they were created under the older claim-based model.
- **FR-008**: The system MUST preserve each node’s existing user-configured settings while removing claim-related interactions.
- **FR-009**: The system MUST remove claim-related state, endpoints, and other contracts from the node firmware and API while keeping node availability and configuration intact.

### Key Entities *(include if feature involves data)*

- **Node**: A user-visible device record with a stable identifier, optional display name, current availability, and configurable settings.
- **Node Label**: The name shown to users when a node is displayed in the interface.
- **Node Settings**: User-managed properties associated with a node, such as its configurable behavior.
- **Legacy Node Record**: A previously stored node record created before claim removal, retained only as needed for migration into the simplified model.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In test runs, 100% of newly available nodes appear in the primary node list without a separate claim step.
- **SC-002**: In usability checks, at least 95% of users can identify a newly added node and open its details without encountering claim terminology.
- **SC-003**: The product contains no visible claim-related node actions or sections on the covered node screens.
- **SC-004**: Existing node records remain visible after the change with no loss of user-configured node settings in migration testing.
- **SC-005**: No claim-related node actions, fields, or states remain exposed in firmware or API validation checks after the migration.

## Assumptions

- Display names remain optional, but they are no longer tied to a claim step.
- Existing node records should continue to appear after the change, even if they were created before the simplified model.
- Node configuration still exists; only the claim boundary is being removed.
- Claim-related historical data may be migrated or discarded as long as the simplified node model remains intact.

## Dependencies

- Existing node registration records must remain available during the transition.
- Node management screens must be updated together so no claim-related dead ends remain exposed.
- Firmware and API changes must be released together so there is no mixed-mode claim behavior.
