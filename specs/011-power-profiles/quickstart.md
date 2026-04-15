# Quickstart: Power Profiles

1. Start the app and API.
2. Open a node card.
3. Select a power profile.
4. Confirm the NodeCard shows the server-assigned profile label.
5. Confirm the node receives `telemetry_interval_ms` and `queue_interval_ms`.
6. Confirm the applied state catches up after the node reports back.

## Verification Checklist

- `power saver` applies 3600000 ms cadence values.
- `balanced` applies 600000 ms cadence values.
- `performance` applies 60000 ms cadence values.
- Changing the profile updates the node without reflashing.
- The NodeCard shows assignment and applied state separately when they differ.
