# Feature Specification: Automations

**Feature Branch**: `015-automation-rules`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "I want to introduce automations, so add a new page with a NyxTable that has the following columns:
- node
- sensor
- operator (< > ==)
- value
- then (dynamic component) 
  - currently should only support pumping: NyxInput, type number, suffix \"ml\" (readonly)
  - soon we'll add alerts/notifications, but that's not part of this spec.
Help me design the page, backend API, database scheme and frontend. I assume the node firmware is already working, so we don't need to make changes there, but I'll need to confirm that.
NyxTable supports an actions slot per row, so we can add actions to the table: edit, delete.
Remember to use the command queue to communicate with the node, the command itself is already working, but is currently triggered manually in the UI.

The automations page has a button \"New Automation\", which opens a modal with the following fields:
- node (NyxSelect, options are the nodes in the system)
- sensor (NyxSelect, options are the sensors of the selected node)
- operator (NyxSelect, options are <, >, ==)
- value (NyxInput, type number)
- then (NyxSelect, options are \"water\" and \"alert\" - \"alert\" is disabled for now)
- dynamic component based on the \"then\" selection: 
  - water: NyxInpux, type number, suffix \"ml\"
The modal should use a NyxForm, with the fields above.
The form should have a button \"Save\", which saves the automation and closes the modal.
The form should have a button \"Cancel\", which closes the modal without saving.

Make sure to never use named strings in the code, only use enums. Most are already defined, either in the app or shared code."

## Clarifications

### Session 2026-04-21

- Q: Should an automation fire only when the reading crosses the threshold, or on every reading that matches the condition? → A: Crossing + cooldown
- Q: How long should the cooldown window be after an automation fires? → A: 30 minutes

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create an automation (Priority: P1)

As an operator, I want to create an automation that watches one node sensor and starts watering when the sensor value crosses my chosen threshold, so the system can react automatically instead of requiring manual pumping.

**Why this priority**: Creating an automation is the core value of the feature and the first usable slice.

**Independent Test**: Create a watering automation for a node and verify it appears in the automations list and is ready to trigger when the matching sensor condition is met.

**Acceptance Scenarios**:

1. **Given** a node with available sensors, **When** I create a valid automation with a sensor, operator, threshold, and watering amount, **Then** the automation is saved and shown in the list.
2. **Given** the creation form is open, **When** I choose the disabled alert action, **Then** I cannot save that action.
3. **Given** I cancel the creation form, **When** the modal closes, **Then** no automation is created.

---

### User Story 2 - Review and manage automations (Priority: P2)

As an operator, I want to see my automations in a table and edit or delete them from the same page, so I can keep rules current as conditions change.

**Why this priority**: Ongoing maintenance is required once automations exist.

**Independent Test**: Open the automations page, verify the table lists saved rules, then edit and delete a rule using the available row actions.

**Acceptance Scenarios**:

1. **Given** saved automations exist, **When** I open the page, **Then** I see each automation with its node, sensor, operator, threshold, and action details.
2. **Given** an automation is listed, **When** I choose edit and save changes, **Then** the updated values appear in the table.
3. **Given** an automation is listed, **When** I choose delete and confirm, **Then** the automation no longer appears in the table.

---

### User Story 3 - Trigger automations automatically (Priority: P2)

As an operator, I want matching sensor readings to enqueue the configured watering command automatically after a threshold crossing, so the system can act on live conditions without manual intervention.

**Why this priority**: An automation that cannot trigger action is not useful.

**Independent Test**: Record a sensor reading that crosses into a matching state and verify the system queues the expected watering command for the selected node, then verify repeated matching readings do not trigger again during the 30-minute cooldown window.

**Acceptance Scenarios**:

1. **Given** a saved automation and a sensor reading that crosses into its matching condition, **When** the reading is processed, **Then** the corresponding watering action is queued for the target node.
2. **Given** a sensor reading that remains within the matching condition during the 30-minute cooldown window, **When** the reading is processed again, **Then** no additional watering action is queued.
3. **Given** an automation targets one node, **When** another node reports a matching reading, **Then** the action is not queued for the wrong node.

### Edge Cases

- A node has no sensors available, so the sensor selector cannot offer invalid choices.
- The selected node changes while the creation form is open, so the available sensors refresh to match the new node.
- The operator or threshold is missing or invalid, so the automation cannot be saved.
- The watering action payload is missing, zero, negative, or otherwise invalid, so the action cannot be saved.
- An existing automation is deleted while it is waiting to trigger, so it must not run afterward.
- The node is offline when an automation triggers, so the command remains handled through the normal queue behavior.
- The alert action remains unavailable for now, so it is visible but cannot be selected or saved.
- Repeated matching readings should not create repeated watering actions during the 30-minute cooldown window.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated automations page that lists saved automations in a table.
- **FR-002**: Each listed automation MUST show the selected node, sensor, comparison operator, trigger value, and resulting action.
- **FR-003**: The automations page MUST provide row actions for editing and deleting an automation.
- **FR-004**: The system MUST provide a creation flow that opens from a "New Automation" action.
- **FR-005**: The creation flow MUST require a node, a sensor belonging to that node, a comparison operator, a numeric trigger value, an action type, and an action-specific value when applicable.
- **FR-006**: The creation flow MUST support the watering action for the first release.
- **FR-007**: The creation flow MUST expose the alert action as unavailable for now.
- **FR-008**: The creation flow MUST close without saving when the user cancels.
- **FR-009**: The system MUST save a valid automation and return it to the automations list.
- **FR-010**: The system MUST allow an existing automation to be updated.
- **FR-011**: The system MUST allow an existing automation to be deleted.
- **FR-012**: The system MUST prevent saving an automation with missing, invalid, or mismatched node and sensor selections.
- **FR-013**: The system MUST evaluate saved automations against incoming sensor readings and trigger only when a reading crosses into a matching state.
- **FR-014**: When a reading satisfies an automation, the system MUST queue the corresponding watering command through the existing command queue.
- **FR-015**: The system MUST not queue an automation action when the reading does not satisfy the configured comparison.
- **FR-016**: The system MUST not require firmware changes to support this feature.
- **FR-017**: The system MUST continue to use the existing command queue path for node communication.
- **FR-018**: The shared data model MUST use existing enum values for operator and action choices instead of ad hoc strings.
- **FR-019**: The system MUST suppress repeated triggers for the same automation for 30 minutes after it fires.
- **FR-020**: The system MUST record every automation trigger in the logs, including the automation details and the action that was performed.
- **FR-021**: The system MUST record creation, update, and deletion of each automation in the logs.
- **FR-022**: The automation action definition MUST be stored as a dynamic JSON object named `command` with a `commandType` field that is validated against the selected action type.

### Non-Functional Requirements

- **NFR-001**: Automation evaluation MUST not add noticeable delay to telemetry ingest; 95% of readings SHOULD be processed and evaluated within 1 second of arrival, and the system MUST continue accepting new readings during automation evaluation.

### Key Entities *(include if feature involves data)*

- **Automation**: A saved rule that connects one node sensor to one action using a comparison and threshold.
- **Automation Condition**: The node, sensor, operator, and trigger value that determine when the rule should fire on a threshold crossing.
- **Automation Action**: The result of a rule, currently watering with a dynamic JSON `command` that includes a `commandType` and later additional action types.
- **Sensor Reading**: The incoming value used to determine whether a rule should trigger.
- **Automation Log Entry**: A record of an automation being created, updated, deleted, or triggered, along with the resulting action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operators can create a valid watering automation in under 2 minutes on the first attempt.
- **SC-002**: At least 95% of saved automations appear in the list immediately after creation or update.
- **SC-003**: When a matching sensor reading is processed, the corresponding watering action is queued in at least 95% of test cases.
- **SC-004**: Non-matching readings do not trigger watering actions in 100% of test cases.
- **SC-005**: Operators can edit or delete an existing automation from the table without leaving the page.

## Assumptions

- The node firmware already supports the pump command path required for watering automations.
- Automation evaluation happens when new sensor readings are received by the system.
- Automations apply only to sensors on the selected node.
- Alert/notification automations are out of scope for this release.
- The repeat-trigger suppression window lasts 30 minutes after a matching automation fires.
- All automation lifecycle events and trigger executions are recorded in the log archive.

## Dependencies

- Existing node inventory and sensor metadata.
- Existing sensor reading ingestion and persistence.
- Existing command queue for node communication and watering execution.
- Existing enum definitions for operator and action values in shared or app code.
