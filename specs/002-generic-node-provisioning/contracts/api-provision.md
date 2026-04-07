# Contract: Pairing Window API

**Owner**: Hub server (`server/api/`)  
**Consumer**: Mobile app (`app/`), Web dashboard (`server/web/`)

---

## POST /api/provision/open

Opens a 5-minute pairing window on the hub. Any new node that registers during this window will be accepted. Only one window can be open at a time; calling this while a window is already open resets the timer.

### Request

```
POST /api/provision/open
Content-Type: application/json
```

Body: empty `{}` or no body.

### Responses

**200 OK**:
```json
{
  "status": "open",
  "expiresAt": 1712400600000
}
```

| Field | Type | Notes |
|---|---|---|
| `status` | `"open"` | Always "open" on success |
| `expiresAt` | number | Unix timestamp ms when window closes |

---

## GET /api/provision/status

Returns the current state of the pairing window. Used by the app to poll for registration progress after opening a window.

### Request

```
GET /api/provision/status
```

### Responses

**200 OK — window open**:
```json
{
  "status": "open",
  "expiresAt": 1712400600000,
  "remainingMs": 240000
}
```

**200 OK — window closed**:
```json
{
  "status": "closed"
}
```

---

## GET /api/nodes

Returns all registered logical nodes, grouped by claim status. Used by the dashboard to populate the "Unclaimed Nodes" section and the main node list.

### Request

```
GET /api/nodes
```

### Response

**200 OK**:
```json
{
  "nodes": [
    {
      "nodeId": "node-001",
      "hwId": "AABBCCDDEEFF",
      "displayName": "Living Room Monstera",
      "claimStatus": "claimed",
      "registeredAt": 1712396400000
    },
    {
      "nodeId": "node-002",
      "hwId": "112233445566",
      "displayName": null,
      "claimStatus": "unclaimed",
      "registeredAt": 1712400000000
    }
  ]
}
```

---

## PATCH /api/nodes/:nodeId

Claims an unclaimed node by assigning a display name. Transitions `claim_status` from `unclaimed` to `claimed`.

### Request

```
PATCH /api/nodes/node-002
Content-Type: application/json
```

```json
{
  "displayName": "Balcony Fern"
}
```

### Responses

**200 OK**:
```json
{
  "nodeId": "node-002",
  "displayName": "Balcony Fern",
  "claimStatus": "claimed"
}
```

**404 Not Found** — node ID does not exist:
```json
{
  "error": "not_found"
}
```

**400 Bad Request** — displayName missing or empty:
```json
{
  "error": "invalid_payload",
  "message": "displayName is required and must be non-empty."
}
```
