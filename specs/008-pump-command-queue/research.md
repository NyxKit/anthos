# Research: Pump Command Queue

## Decision 1: Use a pull-based command queue

- Decision: Nodes will poll for pending commands on a short interval, independent of telemetry delivery.
- Rationale: Telemetry cadence may be intentionally slow, so pump control must not depend on sensor reporting.
- Alternatives considered: Embedding commands in telemetry responses, server push, or BLE control. These were less suitable because they couple control timing to other flows or require a different connectivity model.

## Decision 2: Treat pump actions as queued commands with acknowledgement

- Decision: Each pump action will be represented as a queued command that can be completed or failed by the node.
- Rationale: A queue provides durable delivery, retry visibility, and a clean way to prevent duplicate execution after acknowledgement.
- Alternatives considered: Fire-and-forget control messages and implicit success tracking. These were rejected because they make it hard to know whether a pump action actually ran.

## Decision 3: Keep command ownership tied to the node identity

- Decision: Commands will be associated with a single node identity and returned only to that node.
- Rationale: The existing system already treats node identity as stable and server-assigned, which matches the command target model.
- Alternatives considered: Broadcast control messages and plant-scoped routing. These were rejected because pump control should be explicit and device-specific.

## Decision 4: Store hardware capability on the server

- Decision: The server will track whether a claimed node is `earth` or `watering`, and the nodes management screen will be the only place to change it.
- Rationale: Capability is an operator concern, not a firmware concern, and it must gate whether pump commands can be created at all.
- Alternatives considered: A node-local capability flag and separate firmware builds. These were rejected because they add unnecessary device-side configuration and make the fleet harder to manage.

## Decision 5: Keep the test pump duration conservative but visible

- Decision: The default pump test action uses a 5-second duration.
- Rationale: A 1.5-second run was too short to observe reliably during bring-up, while 5 seconds is long enough to confirm end-to-end actuation.
- Alternatives considered: Hardcoding a shorter duration or requiring an operator-entered value every time. These were less useful during debugging and validation.
