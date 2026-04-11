# Data Model: Anthos Domain Layer

## Entities

### Anthos

- Purpose: Shared backend-facing domain instance used by the app.
- Fields:
  - `setupState`: active connection details used by all subdomains.
  - `nodes`: node access entry point.
  - `rooms`: reserved future entry point.
  - `alerts`: reserved future entry point.
  - `users`: reserved future entry point.
- Relationships:
  - Owns the setup state.
  - Composes the subdomain entry points.

### Setup State

- Purpose: Stored connection information for the active Anthos instance.
- Fields:
  - `connection details`: values required to reach the backend.
  - `authorization state`: whether the instance is currently ready for backend access.
- Relationships:
  - Shared by all subdomains.

### Node Snapshot

- Purpose: A read model representing the node information the dashboard consumes.
- Fields:
  - `node identity`
  - `display name`
  - `status`
  - `last seen`
  - `health and sensor data`
- Relationships:
  - Returned by the node entry point.
  - Transformed by stores into view state.

### Future Domain Placeholder

- Purpose: Reserved entry point for future feature areas.
- Fields:
  - None yet.
- Relationships:
  - Lives under Anthos but remains inactive until future work expands it.

## State Rules

- Anthos starts in an uninitialized state when constructed without setup data.
- Setup can be applied later and should replace the previous active connection details.
- Node data remains readable through the node entry point once setup is complete.
- Future placeholders must not change current node behavior.
