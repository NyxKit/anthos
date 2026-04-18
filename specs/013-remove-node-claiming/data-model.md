# Data Model: Remove Node Claiming

## Node
- Represents a user-visible device in the system.
- Fields: `nodeId`, `hwId`, `displayName` (optional), `capability`, `order` (optional), `registeredAt`, `powerProfile`, `lastSeen`.
- Relationships: Linked to one hardware identity; may be referenced by telemetry, commands, and power profile state.
- Validation: `nodeId` remains stable; `displayName` may be empty; capability and power profile must use supported values.

## Hardware Node
- Represents the immutable physical device identity.
- Fields: `hwId`, `firstSeen`, `lastSeen`, `firmwareVersion`.
- Relationships: One hardware node maps to one logical node record.
- Validation: `hwId` must remain immutable once recorded.

## Node Label
- Represents the text shown to users for a node.
- Fields: display name or stable fallback identifier.
- Relationships: Derived from the node record.
- Validation: If no display name exists, the fallback must still identify the node.

## Node Settings
- Represents user-managed node configuration.
- Fields: capability, order, power profile.
- Relationships: Belongs to one node.
- Validation: Settings updates do not depend on claim state.

## Legacy Claim State
- Represents claim-related data that exists only in older records or migration history.
- Fields: legacy claim status and any removed claim-only metadata.
- Relationships: May be present during migration, but not part of the target model.
- Validation: The target model does not surface this state in contracts or user flows.
