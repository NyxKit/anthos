# Log Contracts

## Resource

`Anthos.logs`

## List Logs

`GET /api/logs`

### Query Parameters

- `nodeId`
- `level`
- `source`
- `q`
- `from`
- `to`
- `limit`
- `before`

### Response

```json
{
  "items": [
    {
      "id": "string",
      "timestampMs": 0,
      "nodeId": "string",
      "level": "info",
      "source": "string",
      "message": "string",
      "meta": {}
    }
  ],
  "nextCursor": "string",
  "hasMore": true
}
```

## Stream Logs

`GET /api/logs/stream`

### Response Shape

- Server-sent events with one `log` event per entry.
- Each event contains a single log entry JSON payload.

## Error Handling

- Missing history should return an empty result set, not a hard failure.
- Expired or unavailable days should be reported as unavailable to the client.
