# Power Profile Contract

## Apply Profile

`PATCH /api/nodes/:nodeId/power-profile`

### Request

```json
{
  "profileId": "balanced",
  "telemetry_interval_ms": 600000,
  "queue_interval_ms": 600000
}
```

### Response

```json
{
  "nodeId": "node-001",
  "assignment": {
    "profileId": "balanced",
    "telemetry_interval_ms": 600000,
    "queue_interval_ms": 600000
  },
  "applied": {
    "profileId": "balanced",
    "telemetry_interval_ms": 600000,
    "queue_interval_ms": 600000,
    "appliedAt": "2026-04-14T10:00:00Z"
  }
}
```

## Get Node Profile

`GET /api/nodes/:nodeId/power-profile`

### Response

```json
{
  "nodeId": "node-001",
  "assignment": {
    "profileId": "balanced",
    "telemetry_interval_ms": 600000,
    "queue_interval_ms": 600000
  },
  "applied": {
    "profileId": "balanced",
    "telemetry_interval_ms": 600000,
    "queue_interval_ms": 600000,
    "appliedAt": "2026-04-14T10:00:00Z"
  }
}
```
