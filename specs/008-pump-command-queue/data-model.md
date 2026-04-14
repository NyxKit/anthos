# Data Model: Pump Command Queue

## Node

- **Purpose**: A physical device that polls for queued commands.
- **Fields**:
  - `nodeId`: Stable node identity.
  - `hwId`: Immutable hardware identity.
  - `status`: Whether the node is available for command delivery.

## Command

- **Purpose**: A queued instruction for one node.
- **Fields**:
  - `commandId`: Unique identifier.
  - `nodeId`: Target node.
  - `type`: Command type, currently pump.
  - `status`: Pending, completed, or failed.
  - `createdAt`: When the command was queued.
  - `updatedAt`: When the status last changed.
  - `payload`: Command details such as run duration.

## Command Queue Flow

- Commands are retrieved by a node through its node-specific command queue.
- The queue returns only pending commands.
- The node acknowledges each command after execution to move it to a terminal state.

## Command Acknowledgement

- **Purpose**: The node’s confirmation of command completion or failure.
- **Fields**:
  - `commandId`: Command being acknowledged.
  - `nodeId`: Node reporting the result.
  - `result`: Completed or failed.
  - `message`: Optional failure detail.
  - `acknowledgedAt`: Time the acknowledgement was recorded.

## State Transitions

- `pending` → `completed` when the node finishes a pump action successfully.
- `pending` → `failed` when the node cannot complete the action.
- Completed commands must not return again once acknowledged.
