# Data Model: Automations

## Automation
- Represents one saved rule that watches a node sensor and can enqueue a watering action.
- Fields: `automationId`, `nodeId`, `sensorType`, `operator`, `thresholdValue`, `commandType`, `command`, `enabled`, `lastTriggeredAt`, `createdAt`, `updatedAt`.
- Relationships: Belongs to exactly one logical node and one sensor type on that node.
- Validation: Node and sensor must match; operator must be one of the supported enum values; threshold must be numeric; command must match the selected command type; alerts remain disabled.

## Automation Operator
- Represents the comparison used to decide whether a reading matches a rule.
- Values: `<`, `>`, `==`.
- Relationships: Every automation has exactly one operator.
- Validation: Operator values come from the shared enum only.

## Automation Action
- Represents the outcome performed when a rule triggers.
- Values: `water` now, with `alert` reserved but disabled.
- Relationships: Every automation has exactly one action type.
- Validation: Watering requires a JSON command that includes a positive volume in milliliters; disabled actions cannot be saved.

## Automation Command
- Represents the dynamic payload for the chosen action type.
- Fields: `commandType`, `payload`.
- Relationships: Stored with the automation and validated against the action type before save.
- Validation: The command shape must be specific to the selected action type; for watering, the command must contain `volumeMl`.

## Automation Cooldown State
- Represents the suppression window after a trigger fires.
- Fields: `lastTriggeredAt`, derived cooldown expiry.
- Relationships: Stored on the automation record so the evaluator can decide quickly whether to skip a repeat trigger.
- Validation: A rule may not fire again until 30 minutes have elapsed since `lastTriggeredAt`.

## Automation Log Entry
- Represents a log record for creation, update, deletion, or trigger execution.
- Fields: `timestamp`, `nodeId`, `level`, `source`, `message`, `meta`.
- Relationships: Associated with one automation event and, for trigger events, one resulting queued command.
- Validation: Trigger logs should include the automation identifier, the reading that caused the trigger, and the action performed.
