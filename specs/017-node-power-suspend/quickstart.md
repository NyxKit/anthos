# Quickstart: Node Power Suspend

## Validate the behavior

1. Build the firmware from `node/`.
2. Flash it to the target device.
3. Set the node to performance mode.
4. Verify the device stays active across multiple telemetry intervals.
5. Set the node to a non-performance mode with a short telemetry interval.
6. Verify the node wakes for its cycle, stays awake for the 10-second grace window, and does not suspend before the next interval when the gap is under 5 minutes.
7. Set the node to a non-performance mode with a longer telemetry interval.
8. Verify the node powers down after telemetry completes.
9. Confirm a queue item that arrives during the grace window is handled before sleep.

## Expected result

- Performance mode stays active.
- Other modes wake only for telemetry and suspend when the next interval is far enough away.
