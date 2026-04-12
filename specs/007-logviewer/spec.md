# Feature Specification: Log Viewer

**Feature Branch**: `007-logviewer`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "let's start wiring up the logviewer, given the brainstorm earlier i'd want the backend to write all incoming messages from the nodes to a logfile (think of a way to keep these contained and organized - maybe one logfile per day, keep logfiles for a month or so?). The backend can then serve these logs (add anthos.logs, similar to anthos.nodes) for the frontend to parse and wire up to the NyxLogVeiwer. Frontend will use a store \"logs\", inside a new subdomain \"logs\"."

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

### User Story 1 - Live Log Stream (Priority: P1)

An operator opens the log viewer and sees incoming node messages appear in near real time, with the newest entries visible at the top of the view.

**Why this priority**: Live visibility is the primary value of a log viewer and is the fastest way to verify that nodes are communicating.

**Independent Test**: Start the viewer, generate a node message, and confirm the message appears without reloading the page.

**Acceptance Scenarios**:

1. **Given** the viewer is open and connected, **When** a new node message arrives, **Then** it appears in the visible list with its timestamp, source, and message text.
2. **Given** the viewer is open and new messages arrive, **When** the list updates, **Then** the newest entries remain visible without losing the ability to inspect older entries.

---

### User Story 2 - Historical Log Browsing (Priority: P2)

An operator selects a previous day or narrows the results by source or severity and reviews the stored log history for troubleshooting.

**Why this priority**: Historical access turns raw log capture into a usable support tool when issues are discovered after the fact.

**Independent Test**: Open a prior day of logs and confirm the expected entries are returned in a stable, paginated view.

**Acceptance Scenarios**:

1. **Given** logs exist for multiple days, **When** an operator selects a specific day, **Then** only entries from that day are shown.
2. **Given** a log filter is applied, **When** the operator changes the filter, **Then** the results update to match the new selection.

---

### User Story 3 - Automatic Retention and Organization (Priority: P3)

The system keeps logs organized by day and automatically removes old daily log archives after the retention window so storage stays bounded.

**Why this priority**: Retention protects the system from unbounded storage growth while preserving enough history for routine troubleshooting.

**Independent Test**: Verify that logs are grouped by date and that entries older than the retention window are no longer available.

**Acceptance Scenarios**:

1. **Given** a new day begins, **When** new node messages arrive, **Then** they are written into that day's log record.
2. **Given** logs are older than the retention window, **When** retention processing runs, **Then** those logs are no longer served to the viewer.

---

### Edge Cases

- A node sends a burst of messages faster than the viewer can display them.
- Multiple nodes emit messages at the same timestamp.
- A daily log archive for a day is missing, incomplete, or corrupted.
- The retention window is reached while a user is viewing older history.
- The viewer reconnects after a temporary loss of connectivity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST record all incoming node messages in an organized log history.
- **FR-002**: The system MUST group log records by calendar day.
- **FR-003**: The system MUST retain log history for approximately 30 days unless a different policy is documented.
- **FR-004**: The system MUST make stored logs available to the log viewer for browsing and review.
- **FR-005**: The system MUST allow users to view log entries in chronological order with the newest entries available first by default.
- **FR-006**: The system MUST allow users to filter logs by date, source, and severity.
- **FR-007**: The system MUST preserve each log entry's timestamp, source, severity, and message content.
- **FR-008**: The system MUST handle missing or unavailable log history gracefully and show a clear empty or unavailable state.
- **FR-009**: The system MUST expose log data through a dedicated logs area that mirrors the existing nodes area in the application.
- **FR-010**: The log viewer MUST keep the displayed log window bounded during a session while supporting live updates and historical browsing without requiring a full page refresh.

### Key Entities *(include if feature involves data)*

- **Log Entry**: A single message captured from a node, including timestamp, source, severity, message text, and optional context.
- **Daily Log Archive**: The collection of log entries for one calendar day, used for organization and retrieval.
- **Log Retention Policy**: The rule that determines how long log history remains available.
- **Log View State**: The user's current filters, selected date, and visible window of entries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operators can see new node messages appear in the viewer within 5 seconds of arrival for 95% of messages.
- **SC-002**: Operators can retrieve a selected day of logs within 2 seconds for 95% of requests.
- **SC-003**: At least 90% of log-viewing sessions can filter or browse to the desired entry without leaving the viewer.
- **SC-004**: Log history remains bounded to the configured retention window, with older entries no longer available after expiry.
- **SC-005**: The log viewer can display at least 1,000 entries in a session without requiring a full reload.

## Assumptions

- Logs are retained for 30 days by default.
- Day-based organization is sufficient for the first version of historical browsing.
- The viewer is intended for operators and developers, not end customers.
- The log feed includes all node-originated messages that are useful for troubleshooting.

## Dependencies

- Existing node message formatting remains stable enough to be surfaced consistently in the viewer.
- The application already has a place in the main navigation where the logs area can be added.
