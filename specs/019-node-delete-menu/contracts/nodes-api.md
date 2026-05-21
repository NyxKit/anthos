# Node API Contract

## Overview

The node management API supports listing, editing, and deleting logical nodes.

## Endpoints

### `GET /api/nodes`

- Returns the current node list.
- Deleted logical nodes must not appear in the response.

### `PATCH /api/nodes/:id/name`

- Updates a node display name.

### `PATCH /api/nodes/:id/capability`

- Updates a node capability.

### `PATCH /api/nodes/:id/order`

- Updates node ordering.

### `DELETE /api/nodes/:id`

- Requires the same authenticated operator access used by the other node edit actions.
- Returns `204 No Content` on success.
- Returns `404` if the node does not exist.
- Returns `401` or `403` for authentication or authorization failures.
- Removes the logical node record only.
- Leaves hardware tracking intact so future telemetry from the same device can recreate the node.

## Expected Behavior

- The delete action is available even when the node is offline.
- The operator-facing warning must explicitly mention the manual reset requirement.
