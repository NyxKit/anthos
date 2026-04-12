# Research: Log Viewer

## 1. Daily log archives

- Decision: Store incoming node messages in one append-only NDJSON archive per calendar day, using a single canonical timezone for day boundaries.
- Rationale: Daily archives are simple to reason about, easy to rotate, and keep the filesystem organized without adding database cleanup work.
- Alternatives considered: One rolling file, per-message files, and a database-first archive.

## 2. Retention

- Decision: Keep the active day plus roughly 30 days of closed archives, with retention checks on startup and once per day.
- Rationale: This matches the feature request, keeps storage bounded, and preserves enough history for routine troubleshooting.
- Alternatives considered: Indefinite retention, manual cleanup only, and compressed archive-only storage.

## 3. API shape

- Decision: Expose logs as a separate `Anthos.logs` resource with structured history endpoints and a live stream endpoint.
- Rationale: The repository already uses resource-shaped client wrappers, and logs need list/filter/history behavior rather than a single latest snapshot.
- Alternatives considered: Reusing `Anthos.nodes`, polling a latest endpoint, and WebSockets for all updates.

## 4. Frontend state

- Decision: Use a Pinia `logs` store that owns filters, selected history state, and a bounded live buffer, while the viewer stays presentational.
- Rationale: This matches the current store pattern and keeps log rendering separate from data transport.
- Alternatives considered: Component-local arrays, one giant persistent array, and splitting the state into multiple stores.

## 5. Rendering approach

- Decision: Feed the Nyx log viewer from a normalized log entry model with timestamp, origin/source, severity, and message.
- Rationale: This is the smallest shape that supports live viewing, filtering, and historical browsing.
- Alternatives considered: Raw text-only logs and UI-specific formatted payloads.
