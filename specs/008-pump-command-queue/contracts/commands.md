# Command Queue Contract

## Get Pending Commands

`GET /api/nodes/:nodeId/commands`

### Response

```json
{
  "nodeId": "node-001",
  "capability": "watering",
  "commands": [
    {
      "commandId": "cmd_123",
      "type": "pump",
      "status": "pending",
      "payload": {
        "volumeMl": 100,
        "durationMs": 5000
      }
    }
  ]
}
```

### Empty Response

```json
{
  "nodeId": "node-001",
  "capability": "earth",
  "commands": []
}
```

## Queue Pump Command

`POST /api/nodes/:nodeId/commands`

### Request

```json
{
  "volumeMl": 100
}
```

### Response

```json
{
  "nodeId": "node-001",
  "commandId": "cmd_123",
  "status": "pending"
}
```

## Update Node Capability

`PATCH /api/nodes/:nodeId/capability`

### Request

```json
{
  "capability": "watering"
}
```

### Response

```json
{
  "nodeId": "node-001",
  "capability": "watering"
}
```

## Acknowledge Command

`POST /api/nodes/:nodeId/commands/:commandId/ack`

### Request

```json
{
  "result": "completed",
  "message": "optional detail"
}
```

### Response

```json
{
  "nodeId": "node-001",
  "commandId": "cmd_123",
  "status": "completed"
}
```
