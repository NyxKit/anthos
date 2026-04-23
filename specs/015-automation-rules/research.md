# Research: Automations

## Decision 1: Evaluate automations on telemetry ingest

- Decision: Evaluate saved automations immediately after new sensor readings are ingested on the server.
- Rationale: This is the earliest reliable point where fresh readings already exist, so it keeps trigger handling centralized and avoids extra polling.
- Alternatives considered: A background poller and client-side evaluation. Those were rejected because they add latency or duplicate logic.

## Decision 2: Use a threshold-crossing trigger with a 30-minute cooldown

- Decision: An automation fires only when a reading crosses into the matching state, then suppresses repeat triggers for 30 minutes.
- Rationale: This prevents repeated watering on steady readings while still responding quickly when conditions change.
- Alternatives considered: Fire on every matching reading or use an unlimited holdoff. Those were rejected because they either spam commands or become too conservative.

## Decision 3: Persist the last trigger time on the automation record

- Decision: Store the most recent trigger time with the automation itself so cooldown checks remain cheap and deterministic.
- Rationale: The system only needs the latest trigger time to enforce suppression, and keeping it on the rule avoids scanning logs during ingest.
- Alternatives considered: Deriving cooldown from log history or a separate event table. Those were rejected because they increase query cost and complicate the trigger path.

## Decision 4: Keep watering as the only enabled action for now

- Decision: Model the action type as an enum with watering enabled and alert/notification disabled in the UI.
- Rationale: The feature request explicitly scopes alerts out while preserving room for future action types.
- Alternatives considered: Shipping alerts behind the same form or hiding them entirely. Those were rejected because the spec asks for a visible but disabled future option.

## Decision 5: Model action configuration as a command-shaped JSON payload

- Decision: Store action details as a dynamic JSON config attached to the automation instead of dedicating a column per action field.
- Rationale: This mirrors the existing command queue payload pattern and keeps future action types from forcing schema churn.
- Alternatives considered: Separate columns for each action type or a generic key/value table. Those were rejected because they fragment the schema or make validation awkward.

## Decision 6: Log both lifecycle events and trigger outcomes at the backend boundary

- Decision: Write automation create, update, delete, and trigger events to the existing log archive, including the performed action and key rule details.
- Rationale: This preserves an auditable history without adding a separate reporting system.
- Alternatives considered: UI-only logs or a separate automation history table. Those were rejected because the log archive already serves as the operational record.
