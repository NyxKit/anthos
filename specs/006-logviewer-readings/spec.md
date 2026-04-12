# Feature Specification: Log Viewer Readings

**Feature Branch**: `[006-logviewer-readings]`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "let's wire up the LogViewer - i want all incoming node readings to appear there. origin = node name, message = the reading"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Live Reading Feed (Priority: P1)

As a dashboard user, I want incoming node readings to appear in the LogViewer as they arrive so I can watch activity without switching views.

**Why this priority**: This is the core value of the feature. If readings do not appear in the log, the LogViewer provides no operational benefit.

**Independent Test**: Send readings from a node and verify each one appears in the log without requiring any other dashboard action.

**Acceptance Scenarios**:

1. **Given** the dashboard is open, **When** a node sends a new reading, **Then** a new log entry appears for that reading.
2. **Given** several readings arrive in sequence, **When** the log updates, **Then** the entries appear in arrival order.

---

### User Story 2 - Clear Node Attribution (Priority: P2)

As a dashboard user, I want each log entry to show the node name as the origin and the reading as the message so I can understand where the data came from.

**Why this priority**: Readings are only useful if users can quickly tell which node produced them and what the reading says.

**Independent Test**: Trigger readings from two different nodes and confirm each entry is labeled with the correct node name and readable reading text.

**Acceptance Scenarios**:

1. **Given** two named nodes send readings, **When** their log entries appear, **Then** each entry shows the correct node name as the origin.
2. **Given** a reading contains sensor details, **When** it is rendered in the log, **Then** the message communicates the reading in a concise human-readable form.

---

### User Story 3 - Session Reviewability (Priority: P3)

As a dashboard user, I want recent readings to remain available in the LogViewer during my session so I can review what happened after the moment it arrived.

**Why this priority**: Operators often need to inspect the recent sequence of events after a burst of activity.

**Independent Test**: Leave the dashboard open while multiple readings arrive and confirm earlier entries remain available for review.

**Acceptance Scenarios**:

1. **Given** the dashboard remains open, **When** additional readings arrive, **Then** earlier log entries remain visible in the session history.
2. **Given** the log contains many entries, **When** the user scrolls through it, **Then** they can review earlier readings without losing the newer ones.

---

### Edge Cases

- Multiple readings from the same node arrive in rapid succession and each one still appears as its own log entry.
- Readings from different nodes interleave and retain the correct origin for each entry.
- A node sends a reading before it has a user-facing name; the log uses the current stable node label until a name is available.
- A single incoming update contains more than one measurement; each measurement is represented distinctly so no data is hidden.
- The LogViewer already contains older entries when new readings arrive; new entries should not erase recent history.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST add every incoming node reading to the LogViewer.
- **FR-002**: Each log entry MUST use the node name as its origin.
- **FR-003**: Each log entry MUST use the reading content as its message.
- **FR-004**: When a node produces multiple readings in one update, the system MUST represent each reading distinctly in the log.
- **FR-005**: The LogViewer MUST preserve the arrival order of readings.
- **FR-006**: The LogViewer MUST keep recent readings available for review during the active dashboard session.
- **FR-007**: The system MUST keep readings from different nodes visually distinguishable by origin.

### Key Entities *(include if feature involves data)*

- **Log Entry**: A single visible item in the LogViewer containing an origin, a message, and a time of arrival.
- **Node Reading**: A measurement or status update emitted by a node.
- **Node Name**: The human-readable label shown for a node and used as the log origin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see a new log entry for a reading within 5 seconds of it arriving.
- **SC-002**: At least 95% of readings from named nodes appear with the correct origin and readable message.
- **SC-003**: Users can review at least 100 consecutive readings in one session without earlier entries being discarded automatically.
- **SC-004**: In a mixed-node test with at least 10 nodes, users can correctly identify the source node for 100% of sampled log entries.

## Assumptions

- A node reading can be associated with a human-readable node name at the time it is shown in the log.
- If a single update contains multiple measurements, each measurement should be surfaced so the user does not miss data.
- The LogViewer is intended to show recent operational history, not a permanent archive.

## Dependencies

- Incoming node readings must already be available to the dashboard at runtime.
- Each reading must include enough information to identify its node and render a readable message.
