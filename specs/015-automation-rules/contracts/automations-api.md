# Contract: Automations API

## Overview
The automations API manages saved watering rules and exposes them to the automations page.

## GET /api/automations
- Returns all saved automations for the table view.

### Response shape
```json
{
  "automations": [
    {
      "automationId": "auto-001",
      "nodeId": "node-001",
      "sensorType": "moisture",
      "operator": "<",
      "thresholdValue": 30,
      "commandType": "water",
      "command": {
        "volumeMl": 100
      },
      "enabled": true,
      "lastTriggeredAt": null,
      "createdAt": 1713456000000,
      "updatedAt": 1713456000000
    }
  ]
}
```

## POST /api/automations
- Creates a new automation.

### Request shape
```json
{
  "nodeId": "node-001",
  "sensorType": "moisture",
  "operator": "<",
  "thresholdValue": 30,
  "commandType": "water",
  "command": {
    "volumeMl": 100
  }
}
```

## PATCH /api/automations/:automationId
- Updates an existing automation.

### Request shape
```json
{
  "nodeId": "node-001",
  "sensorType": "moisture",
  "operator": ">",
  "thresholdValue": 40,
  "commandType": "water",
  "command": {
    "volumeMl": 120
  },
  "enabled": true
}
```

## DELETE /api/automations/:automationId
- Deletes an existing automation.

## Behavior
- Rejects sensor selections that do not belong to the selected node.
- Rejects alert actions for now.
- Enforces the 30-minute cooldown on repeat triggers.
- Logs create, update, delete, and trigger events to the existing log archive.

## Notes
- Existing node and telemetry endpoints remain the source of node and reading data.
- The automation UI can derive sensor choices from the node’s current readings and existing node metadata.
