# Research: Power Profiles

## Decision 1: Use app-owned profile definitions

- Decision: The app will own the profile names and interval values and send them to the node when a profile is selected.
- Rationale: This keeps cadence values easy to tune without changing firmware.
- Alternatives considered: Hardcoding the values on the node or in the server alone. Those options make profile tuning slower and more brittle.

## Decision 2: Persist the active profile on the node

- Decision: The selected profile and interval values will be stored on the node so the cadence survives reconnects and restarts.
- Rationale: Node behavior should remain stable after a reboot.
- Alternatives considered: Keeping the profile only in memory. That would lose the selected cadence after power loss.

## Decision 3: Apply cadence values at runtime

- Decision: The node should adopt the new telemetry and queue intervals when the app sends a profile update, rather than requiring reflashing.
- Rationale: Operators need to switch profiles from the UI with immediate effect.
- Alternatives considered: Requiring a firmware rebuild or manual configuration entry on the device. Those approaches are too slow for routine use.

## Decision 4: Separate assigned and applied profile state

- Decision: The server-assigned profile is the canonical active profile for the UI, and node-applied state is reported separately.
- Rationale: This keeps the NodeCard stable when a node is offline or still applying a change, while still surfacing mismatches.
- Alternatives considered: Treating node-applied state as the active profile. That makes the UI flicker or regress when delivery is delayed.
