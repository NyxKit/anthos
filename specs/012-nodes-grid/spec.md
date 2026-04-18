# Feature Specification: Nodes Grid

**Feature Branch**: `012-nodes-grid`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "need a NodesGrid component with the only prop being limit (number, optional) to reuse on Dashboard and NodesView. The grid component should work directly with the data from the store. Once we have that grid component, we can reuse it in NodesView and wire up any remaining claiming functionality from there."

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

### User Story 1 - Compact dashboard summary (Priority: P1)

As a dashboard user, I want to see a compact node grid so I can quickly understand the current claimed nodes without scanning the full nodes page.

**Why this priority**: The dashboard is the first place users check for an at-a-glance view of the system.

**Independent Test**: Open the dashboard with claimed nodes present and verify the grid shows the expected compact subset using the shared layout.

**Acceptance Scenarios**:

1. **Given** claimed nodes exist, **When** the dashboard loads, **Then** the compact grid shows up to the configured limit of claimed nodes.
2. **Given** more claimed nodes exist than the configured limit, **When** the dashboard loads, **Then** only the first visible subset appears in the grid.
3. **Given** no claimed nodes exist, **When** the dashboard loads, **Then** the dashboard shows an empty state instead of a grid.

---

### User Story 2 - Full nodes management view (Priority: P1)

As a nodes page user, I want the same shared grid to show all claimed nodes so I can manage the full node list from one place.

**Why this priority**: The nodes page is the primary management surface, so it must present the complete roster.

**Independent Test**: Open the nodes page with claimed nodes present and verify the full claimed set appears in the shared grid without a limit.

**Acceptance Scenarios**:

1. **Given** claimed nodes exist, **When** the nodes page loads, **Then** the grid shows all claimed nodes.
2. **Given** the nodes page is shown, **When** the node list changes, **Then** the grid reflects the updated roster on refresh.
3. **Given** no claimed nodes exist, **When** the nodes page loads, **Then** the page shows an empty claimed-nodes state.

---

### User Story 3 - Claim nodes from the nodes page (Priority: P2)

As a user onboarding a node, I want to keep the existing claim flow available from the nodes page so unclaimed nodes can still be named and brought into the shared grid.

**Why this priority**: The shared grid should not block the existing registration and claim workflow.

**Independent Test**: Open the nodes page with an unclaimed node, claim it, and verify it moves into the claimed-node view after the change is saved.

**Acceptance Scenarios**:

1. **Given** an unclaimed node is available, **When** the user opens the claim flow and completes it, **Then** the node becomes part of the claimed set shown in the nodes page.
2. **Given** the claim flow is cancelled, **When** the user returns to the nodes page, **Then** the unclaimed node remains unchanged.

---

### Edge Cases

- The configured limit is larger than the available claimed nodes, so the grid shows only the available nodes.
- The configured limit is zero or omitted, so the grid shows the default full list behavior for that view.
- Node data changes while the page is open, so the grid updates without requiring a separate refresh action.
- There are unclaimed nodes but no claimed nodes, so the nodes page still supports the claim flow even though the shared grid is empty.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The product MUST present a reusable node grid that reads from the existing node list data.
- **FR-002**: The reusable node grid MUST accept an optional `limit` value that caps how many nodes are shown.
- **FR-003**: When `limit` is not provided, the reusable node grid MUST show all eligible nodes for the current view.
- **FR-004**: The dashboard MUST use the reusable node grid to show a compact claimed-node summary.
- **FR-005**: The nodes page MUST use the same reusable node grid to show the full claimed-node list.
- **FR-006**: The nodes page MUST continue to expose the existing claim flow for unclaimed nodes.
- **FR-007**: When a node is claimed, it MUST appear in the claimed-node view after the change is saved and the list updates.
- **FR-008**: When no nodes are available for a given view, the product MUST show a clear empty state.

### Key Entities *(include if feature involves data)*

- **Node**: A physical device shown in the product, identified by an ID and characterized by its name, claim status, capability, order, and power profile.
- **Node Grid**: A reusable presentation of nodes that adapts to the current page and optional limit.
- **Claim Flow**: The user journey used to convert an unclaimed node into a named node visible in the claimed-node view.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dashboard shows no more than 3 claimed nodes in its compact summary.
- **SC-002**: The nodes page shows the full claimed-node list without requiring a separate layout pattern.
- **SC-003**: Users can complete a node claim on the nodes page and see the node appear in the claimed list during the same session.
- **SC-004**: In review testing, both dashboard and nodes page use the same node presentation pattern for at least 100% of claimed-node displays.

## Assumptions

- The dashboard compact grid defaults to a limit of 3 nodes.
- The shared node grid is intended to show claimed nodes only; unclaimed nodes remain part of the claim workflow.

## Dependencies

- Existing node list data and claim flow.
- Existing node card presentation used by the shared grid.
