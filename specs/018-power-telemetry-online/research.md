# Research: Power Telemetry Online Status

## Decision 1: Put status timing in shared node logic
- **Decision**: Keep the online/offline threshold calculation in `shared/src/nodes/classes/PlantNode.ts`.
- **Rationale**: The dashboard already derives NodeCard status from `PlantNode#getStatus()`, so fixing the shared calculation updates every consumer consistently.
- **Alternatives considered**: Recomputing status only in the dashboard store or component would be narrower but would risk status drift anywhere else the shared node model is used.

## Decision 2: Preserve the three-profile cadence model
- **Decision**: Use the existing profile intervals of 1 second, 10 minutes, and 1 hour, with a 3x silence threshold for offline detection.
- **Rationale**: The spec already defines those values and the current shared model already computes the threshold as interval times three.
- **Alternatives considered**: Introducing a new status category for hibernation would add UX complexity without solving the underlying timing mismatch.

## Decision 3: Reset the quiet window on profile change
- **Decision**: Treat a profile change as the start of a fresh quiet window.
- **Rationale**: This avoids false offline transitions when a node intentionally switches cadence and remains quiet under the new mode.
- **Alternatives considered**: Reusing the previous telemetry timestamp would preserve historical continuity but would incorrectly penalize intentional mode changes.

## Decision 4: No new external contract
- **Decision**: Do not add new API endpoints or response shapes for this feature.
- **Rationale**: The behavior change is internal to node status interpretation and the existing API already exposes the data required by the UI.
- **Alternatives considered**: Adding a dedicated online/offline endpoint would duplicate existing status semantics and increase maintenance burden.
