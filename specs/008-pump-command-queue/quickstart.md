# Quickstart: Pump Command Queue

1. Start the server with the command queue feature enabled.
2. Start a node using the current firmware build.
3. Ensure the node has a valid node identity, server target, and hardware capability configured.
4. On the `/nodes` page, mark the node as `watering` if it should accept pump commands.
5. Queue a pump command for the node with the default 100 ml volume.
6. Wait for the node’s command poll interval.
7. Confirm the node retrieves the command, runs the pump action, and acknowledges the result.
8. Confirm the server log archive shows pump queue and completion events.

## Verification Checklist

- The node continues to poll even when telemetry is infrequent.
- Pending commands are delivered to the correct node.
- Completed commands do not reappear after acknowledgement.
- Earth-only nodes reject pump commands.
- Watering nodes accept pump commands and expose the same soil sensor wiring.
- Pump queue attempts appear in the server logs even when rejected.
- Pump runtime is roughly `20 s` per `100 ml` of water.
- UI pump input is in `ml`; the backend converts it to runtime using the documented pump rate.

## Manual Queue Check

1. PATCH the node capability through `/nodes` so the server marks it as `watering`.
2. POST a pump command to `/api/nodes/:nodeId/commands` with a `volumeMl` value.
3. Confirm the node retrieves the command on its polling cycle.
4. Confirm the acknowledgement updates the command to completed or failed.
5. Check the server log archive for the corresponding queue, completion, or rejection entry.
