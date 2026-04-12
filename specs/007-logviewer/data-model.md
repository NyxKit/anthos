# Data Model: Log Viewer

## Log Entry

- `id`: Stable entry identifier.
- `timestampMs`: When the message occurred.
- `nodeId`: Originating node identifier, if known.
- `level`: Severity of the message.
- `source`: Component or subsystem that produced the message.
- `message`: Human-readable log message.
- `meta`: Optional structured context.

### Rules

- Each entry must preserve its original timestamp and source information.
- Entries must be sortable chronologically.
- Entries must remain usable even when some optional context is missing.

## Daily Log Archive

- `day`: Calendar day key for the archive.
- `entries`: Ordered collection of log entries for that day.
- `status`: Available, unavailable, or expired.

### Rules

- Exactly one active archive exists for the current day.
- Closed archives are retained only within the retention window.
- Missing or corrupted archives must not block access to other days.

## Log View State

- `filters`: Selected day, source, level, and search terms.
- `followTail`: Whether the viewer stays pinned to newest entries.
- `visibleWindow`: Current bounded session buffer.
- `historyCursor`: Position for older results.

### Rules

- Filters must be independently resettable.
- The visible window must remain bounded during a session.
- Historical browsing must not destroy the live tail state.
