# Feature Specification: Node Actions Menu

**Feature Branch**: `[019-node-delete-menu]`  
**Created**: 2026-04-30  
**Status**: Draft  
**Input**: User description: "Allow deleting a node from an always-available node actions menu, with a warning that the node must be manually reset."

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

### User Story 1 - Access Node Actions (Priority: P1)

As an operator, I want each node to have an always-available actions menu so I can quickly choose edit or delete regardless of node status.

**Why this priority**: Accessing node actions is the entry point for both maintenance tasks and removal, and it must work even when a node is offline.

**Independent Test**: Open the node list with online and offline nodes and verify the same menu entry is available for both, with edit and delete options.

**Acceptance Scenarios**:

1. **Given** a node that is online, **When** I open its actions menu, **Then** I see edit and delete options.
2. **Given** a node that is offline, **When** I open its actions menu, **Then** I see the same edit and delete options.

---

### User Story 2 - Delete a Node Safely (Priority: P1)

As an operator, I want to delete a node after a clear warning so I understand the node must be manually reset to avoid confusion if it comes back online later.

**Why this priority**: Deleting a node is the new core behavior, and the warning prevents accidental data loss or operator confusion.

**Independent Test**: Delete a node from the menu and verify the confirmation warning explains the manual reset requirement before the deletion is completed.

**Acceptance Scenarios**:

1. **Given** a node in the list, **When** I choose delete, **Then** I am warned that I must manually reset the node.
2. **Given** I confirm deletion, **When** the delete completes, **Then** the node is removed from the list.

---

### User Story 3 - Recover After Deletion (Priority: P2)

As an operator, I want a deleted node to reappear if it resumes reporting without being manually reset so the system can safely treat it as active again instead of blocking it.

**Why this priority**: This preserves the safe behavior the user expects when a node was deleted but not physically reset.

**Independent Test**: Delete a node, do not manually reset it, then have it report again and verify it can be registered and shown again without manual intervention.

**Acceptance Scenarios**:

1. **Given** a deleted node that was not manually reset, **When** it reports again, **Then** it can be recognized and shown as active again.

---

### Edge Cases

- A node that is offline must still show the actions menu so it can be deleted.
- Deleting a node that has already been manually reset should still complete cleanly.
- If a deleted node later resumes reporting without being manually reset, it should be treated as a valid returning node rather than a duplicate error.
- Operators should not need to guess whether deletion is reversible; the warning must clearly state that the node itself still needs manual reset.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: The node list MUST present a single actions menu entry for each node.
- **FR-002**: The actions menu MUST be available for nodes whether they are online or offline.
- **FR-003**: The actions menu MUST include both edit and delete actions.
- **FR-004**: Choosing delete MUST require a confirmation step before the node is removed.
- **FR-005**: The deletion confirmation MUST warn that the node must be manually reset.
- **FR-006**: Confirmed deletion MUST remove the node from the user-visible node list.
- **FR-007**: Deletion MUST not prevent a later node return from being treated as a valid active node if the hardware was not manually reset.
- **FR-008**: The warning text MUST make it clear that leaving the node unreset may allow it to resume reporting again.

### Key Entities *(include if feature involves data)*

- **Node**: A physical device represented in the operator view, including its current status and available actions.
- **Node Actions Menu**: The per-node control entry that provides edit and delete operations.
- **Deletion Warning**: The confirmation message that explains the manual reset requirement before removal.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 100% of nodes in the list expose the actions menu, regardless of online or offline status.
- **SC-002**: At least 95% of operators can find and use delete on their first attempt without additional guidance.
- **SC-003**: 100% of delete actions present the manual reset warning before completion.
- **SC-004**: After deletion, operators can confirm the node is removed from the list within one refresh cycle.

## Assumptions

- Deletion removes the node from the operator-facing list but does not physically reset the hardware.
- If a deleted node is later seen again and has not been manually reset, it can return to active use without special recovery steps.
- The existing edit behavior remains available through the new actions menu.

## Dependencies

- Existing node list and node detail views.
- Existing node identity and return-to-service behavior for previously seen hardware.
