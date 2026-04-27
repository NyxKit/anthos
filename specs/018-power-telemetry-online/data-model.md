# Data Model: Power Telemetry Online Status

## Entities

### Power Profile
- **Fields**: `id`, `label`, `intervalMs`
- **Relationships**: Assigned to a node; used to derive the expected quiet limit.
- **Validation Rules**: Must remain one of the canonical profiles: performance, balanced, power saver.

### Logical Node
- **Fields**: `nodeId`, `hwId`, `displayName`, `powerProfile`, `powerProfileAssignedAt`, `registeredAt`
- **Relationships**: References a single active power profile.
- **Validation Rules**: Every managed node must have a profile for status calculation.
- **Validation Rules**: The last profile assignment timestamp starts the quiet window after a profile change.

### Node Status
- **Fields**: `connected`, `disconnected`, `idle`, `error`
- **Relationships**: Derived from telemetry recency and active profile.
- **Validation Rules**: `connected` is shown while the node is within the expected quiet limit; `disconnected` is shown after the limit is exceeded.

## State Transition Rules

- A node stays `connected` during intentional quiet periods that are shorter than its profile threshold.
- A node transitions to `disconnected` when silence exceeds three expected intervals for the active profile.
- A profile change starts a fresh quiet window from the moment the change is accepted.
- New telemetry immediately restores `connected` status after a disconnect.

## Notes

- No new persisted entity is required.
- The status calculation should remain deterministic from telemetry timestamp and active profile.
