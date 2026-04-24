# Research: Node Power Suspend

## 1. Cutoff threshold

- **Decision**: Use a 5-minute cutoff for automatic suspend between telemetry intervals.
- **Rationale**: 5 minutes is the best balance between avoiding needless wake/sleep churn and still conserving battery for short gaps. It is long enough to cover common short intervals, but not so long that the device stays awake for extended idle periods.
- **Alternatives considered**:
  - 1 minute: too aggressive; risks frequent suspend/wake churn for normal short intervals.
  - 2 minutes: still narrow and likely to suspend too often for bursty telemetry patterns.
  - 10 minutes: too permissive; would leave hardware awake longer than necessary and hurt battery life.

## 2. Power behavior rules

- **Decision**: Performance mode is always-on; all other modes follow interval-based wake, telemetry, and suspend behavior.
- **Rationale**: This matches the feature intent and keeps the exception simple and predictable.
- **Alternatives considered**:
  - Making performance mode also obey the cutoff: rejected because it conflicts with the requested always-on behavior.
  - Adding per-mode cutoffs: rejected because it adds complexity without a stated need.

## 3. Scope boundary

- **Decision**: Keep the cutoff logic as a global rule for suspend decisions and do not expose power-profile concepts to the node’s operational flow.
- **Rationale**: The node behavior stays easy to reason about, while the higher-level scheduling layer can decide when suspension is allowed.
- **Alternatives considered**:
  - Embedding mode-specific power policy throughout the node: rejected because it would make the firmware harder to maintain.
