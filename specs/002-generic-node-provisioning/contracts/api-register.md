# Contract: Node Registration API

**Owner**: Hub server (`server/api/`)  
**Consumer**: Node firmware (`node/`)

---

## POST /api/register

Registers a node hardware ID with the hub and returns a logical node ID. Gated by a pairing window for new devices; known devices bypass the window.

### Request

```
POST /api/register
Content-Type: application/json
```

```json
{
  "hwId": "AABBCCDDEEFF",
  "firmwareVersion": "1.0.0"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `hwId` | string | yes | 12-char uppercase hex, derived from ESP32 eFuse MAC |
| `firmwareVersion` | string | yes | Semver string compiled into firmware |

### Responses

**201 Created** — New hardware ID, registered successfully (pairing window was open):
```json
{
  "nodeId": "node-001",
  "status": "registered"
}
```

**200 OK** — Known hardware ID, re-registration (no pairing window required):
```json
{
  "nodeId": "node-001",
  "status": "reconnected"
}
```

**403 Forbidden** — New hardware ID but no pairing window is open:
```json
{
  "error": "pairing_window_closed",
  "message": "Open a pairing window from the app or dashboard before adding a new node."
}
```

**400 Bad Request** — Missing or invalid fields:
```json
{
  "error": "invalid_payload",
  "message": "hwId and firmwareVersion are required."
}
```

### Behavior

1. Validate payload (400 if invalid)
2. Upsert `hardware_nodes` record (create or update `last_seen` + `firmware_version`)
3. Check if `logical_nodes` record exists for `hw_id`
   - If yes → return 200 with existing `node_id`
   - If no → check if pairing window is open
     - If open → generate new `node_id`, insert `logical_nodes` record, return 201
     - If closed → return 403

### Node Retry Behavior

On 403, the node MUST retry at 30-second intervals indefinitely. The user is expected to open the pairing window via the app, at which point the next retry will succeed.
