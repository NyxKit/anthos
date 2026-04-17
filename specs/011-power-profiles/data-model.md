# Data Model: Power Profiles

## Power Profile

- **Purpose**: A named cadence preset that defines how often a node reports telemetry and checks its action queue.
- **Fields**:
  - `profileId`: Stable identifier.
  - `name`: Human-readable profile name.
  - `telemetryIntervalMs`: Telemetry cadence in milliseconds.
  - `queueIntervalMs`: Action-queue cadence in milliseconds.

## Node Profile Assignment

- **Purpose**: The server-assigned power profile for a specific node.
- **Fields**:
  - `nodeId`: Target node identifier.
  - `profileId`: Selected profile.
  - `telemetryIntervalMs`: Assigned telemetry cadence.
  - `queueIntervalMs`: Assigned action-queue cadence.
  - `updatedAt`: When the assignment last changed.

## Node Applied Profile State

- **Purpose**: The most recent profile cadence successfully applied on the node.
- **Fields**:
  - `nodeId`: Target node identifier.
  - `profileId`: Last applied profile.
  - `telemetryIntervalMs`: Applied telemetry cadence.
  - `queueIntervalMs`: Applied action-queue cadence.
  - `appliedAt`: When the node confirmed the update.
  - `lastError`: Optional failure detail when the latest apply attempt failed.

## State Transitions

- `unassigned` -> `assigned` when an operator selects a profile for a node.
- `assigned` -> `assigned` when profile values are edited centrally and pushed again.
- `assigned` remains active until replaced by another valid profile.
- `applied` updates only after the node confirms the received cadence values.
