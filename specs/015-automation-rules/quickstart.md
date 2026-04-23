# Quickstart: Automations

## Goal
Verify the automations feature from the desktop app and server API.

## Prerequisites
- Existing nodes and recent telemetry data.
- A node that supports watering.

## Verify the API
1. Start the API server.
2. Request `GET /api/automations` and confirm the response is empty or contains saved rules.
3. Create a watering automation with `POST /api/automations` using `commandType` and `command`.
4. Update the automation with `PATCH /api/automations/:automationId` using the same field names.
5. Delete the automation with `DELETE /api/automations/:automationId`.

## Verify the UI
1. Open the automations page.
2. Create a new automation from the modal.
3. Confirm the new row appears in the table.
4. Edit the row and confirm the values update.
5. Delete the row and confirm it is removed.

## Verify Triggering
1. Send a sensor reading that crosses the saved threshold.
2. Confirm the server queues a watering command through the existing command queue.
3. Confirm the trigger is written to the log archive.
4. Send another matching reading within 30 minutes and confirm no second trigger fires.

## Tests
- Run the server tests.
- Run the app tests.
