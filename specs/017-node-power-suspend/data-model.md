# Data Model: Node Power Suspend

## Entities

### Power Mode

- **Purpose**: Describes how the node should behave between telemetry intervals.
- **Fields**:
  - `name`: The selected operating mode.
  - `always_on`: Whether the node must avoid automatic suspension.
- **Rules**:
  - Performance mode must be marked always-on.
  - Non-performance modes may suspend only when the cutoff allows it.

### Wake Interval

- **Purpose**: The scheduled time window when the node must become active to do its regular work.
- **Fields**:
  - `next_due_at`: The next scheduled wake time.
  - `remaining_until_due`: Time left before the next interval.
- **Rules**:
  - Regular work must run at each scheduled interval.
  - The node may remain active only if the next interval is shorter than the cutoff.

### Suspend Cutoff

- **Purpose**: Defines the minimum gap before the next telemetry interval that allows suspension.
- **Fields**:
  - `duration`: The cutoff duration.
- **Rules**:
  - Default value is 5 minutes.
  - If remaining time is below the cutoff, the node stays awake until the next interval.
  - If remaining time meets or exceeds the cutoff, the node may suspend after the grace window expires.

### Grace Window

- **Purpose**: A short delay after a cycle completes so slightly late queue work is not missed.
- **Fields**:
  - `duration`: The grace duration.
- **Rules**:
  - Default value is 10 seconds.
  - The node must stay awake for the full grace window after each cycle.

## State Behavior

- `Active`: Node is awake and can send telemetry.
- `Waiting`: Node is idle between intervals.
- `Suspending`: Node is transitioning to a low-power state.
- `Performance`: Node stays active continuously.

## Transitions

- `Performance -> Active`: performance mode selected.
- `Active -> Waiting`: cycle completed and the grace window is still open.
- `Active -> Suspending`: cycle completed, the grace window expired, and the next interval meets or exceeds the cutoff.
- `Waiting -> Active`: next telemetry interval arrives.
