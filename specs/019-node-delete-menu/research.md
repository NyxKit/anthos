# Research: Node Actions Menu

## Decision 1: Delete the logical node record, not the hardware record

- Decision: Implement node deletion as removal of the logical node row while keeping the hardware row intact.
- Rationale: Telemetry ingestion already recreates a logical node when a known hardware device reports again, so preserving the hardware record lets a non-reset device safely re-register later.
- Alternatives considered: Soft delete on the logical node, deleting hardware state too. Soft delete would keep the node visible in other places and complicate list behavior; deleting hardware state would break the re-registration path the user wants to preserve.

## Decision 2: Keep edit as an existing action and make delete the always-available path

- Decision: Replace the standalone edit button with a three-dot menu that contains edit and delete, but only delete must be available when the node is offline.
- Rationale: This preserves the current edit flow and keeps deletion discoverable without weakening the existing online-state safety rule for edits.
- Alternatives considered: Separate edit and delete buttons, or enabling edit even when offline. Separate buttons would crowd the card header; enabling edit offline would change existing behavior beyond the request.

## Decision 3: Use the current modal-and-dropdown interaction pattern

- Decision: Reuse the existing dropdown and modal patterns already used in the node card actions area for the new confirmation flow.
- Rationale: This keeps the interaction consistent with the rest of the app and limits the feature to the smallest necessary UI changes.
- Alternatives considered: A dedicated delete page, a browser alert, or a custom popover. Those options would add friction or duplicate patterns already present in the UI.
