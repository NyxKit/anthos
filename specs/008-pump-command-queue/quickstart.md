# Quickstart: Pump Command Queue

1. Start the server with the command queue feature enabled.
2. Start a node using the current firmware build.
3. Ensure the node has a valid node identity, server target, and hardware capability configured.
4. On the `/nodes` page, mark the node as `watering` if it should accept pump commands.
5. Queue a pump command for the node with the default 5-second duration.
6. Wait for the node’s command poll interval.
7. Confirm the node retrieves the command, runs the pump action, and acknowledges the result.

## Verification Checklist

- The node continues to poll even when telemetry is infrequent.
- Pending commands are delivered to the correct node.
- Completed commands do not reappear after acknowledgement.
- Earth-only nodes reject pump commands.
- Watering nodes accept pump commands and expose the same soil sensor wiring.

## Manual Queue Check

1. PATCH the node capability through `/nodes` so the server marks it as `watering`.
2. POST a pump command to `/api/nodes/:nodeId/commands` with a duration in milliseconds.
3. Confirm the node retrieves the command on its polling cycle.
4. Confirm the acknowledgement updates the command to completed or failed.
