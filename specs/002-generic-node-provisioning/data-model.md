# Data Model: Generic Node Provisioning

**Branch**: `002-generic-node-provisioning` | **Date**: 2026-04-06

## Overview

This feature introduces a two-layer identity model for nodes:
- **Hardware Node** — immutable, anchored to the physical chip's MAC address
- **Logical Node** — user-facing identity assigned by the hub, can be named and claimed

The existing `readings` table is unchanged. The `node_id` column in `readings` will reference logical node IDs going forward.

---

## Database Schema (Server — SQLite via sql.js)

### `hardware_nodes` (new)

Immutable record created on first registration. Never deleted.

```sql
CREATE TABLE IF NOT EXISTS hardware_nodes (
  hw_id           TEXT    PRIMARY KEY,          -- 12-char uppercase hex MAC (e.g. "AABBCCDDEEFF")
  first_seen      INTEGER NOT NULL,             -- Unix timestamp ms, first registration
  last_seen       INTEGER NOT NULL,             -- Unix timestamp ms, most recent registration attempt
  firmware_version TEXT                         -- Semver string from registration payload (e.g. "1.2.0")
);
```

### `logical_nodes` (new)

Created by the hub when a new `hw_id` registers during an open pairing window. One `hw_id` maps to exactly one `logical_node` per hub.

```sql
CREATE TABLE IF NOT EXISTS logical_nodes (
  node_id         TEXT    PRIMARY KEY,          -- Hub-assigned slug (e.g. "node-001", auto-incremented)
  hw_id           TEXT    NOT NULL REFERENCES hardware_nodes(hw_id),
  display_name    TEXT,                         -- User-assigned name, NULL until claimed
  claim_status    TEXT    NOT NULL DEFAULT 'unclaimed', -- 'unclaimed' | 'claimed'
  registered_at   INTEGER NOT NULL              -- Unix timestamp ms
);

CREATE INDEX IF NOT EXISTS idx_logical_nodes_hw_id ON logical_nodes(hw_id);
CREATE INDEX IF NOT EXISTS idx_logical_nodes_status ON logical_nodes(claim_status);
```

### `readings` (existing — unchanged)

The `node_id` in this table now semantically refers to a `logical_nodes.node_id`. No foreign key enforced (sql.js limitation), but application layer maintains consistency.

---

## Entity Descriptions

### HardwareNode

| Field | Type | Notes |
|---|---|---|
| `hw_id` | string | 12-char uppercase hex, derived from ESP32 eFuse MAC |
| `first_seen` | timestamp (ms) | Set on first-ever registration, never updated |
| `last_seen` | timestamp (ms) | Updated on every registration attempt |
| `firmware_version` | string | Semver from firmware build constant |

**Invariants:**
- `hw_id` is globally unique per physical device
- Record is never deleted (supports replacement/history tracing)

---

### LogicalNode

| Field | Type | Notes |
|---|---|---|
| `node_id` | string | Auto-generated slug, e.g. `node-001`, `node-002` |
| `hw_id` | string | Foreign key to `hardware_nodes.hw_id` |
| `display_name` | string \| null | Null until user claims and names the node |
| `claim_status` | enum | `unclaimed` → `claimed` |
| `registered_at` | timestamp (ms) | When logical ID was first assigned |

**Invariants:**
- One `hw_id` maps to at most one `node_id` per hub
- `claim_status` transitions from `unclaimed` to `claimed` when user assigns a name; not reversible
- `node_id` generation: query `SELECT COUNT(*) FROM logical_nodes` → format as `node-%03d`

---

### ProvisioningWindow (Server in-memory — not persisted)

| Field | Type | Notes |
|---|---|---|
| `opened_at` | timestamp (ms) | When the window was opened |
| `expires_at` | timestamp (ms) | `opened_at + 5 * 60 * 1000` (5 minutes) |
| `is_open` | boolean | Derived: `Date.now() < expires_at` |

**Behavior:**
- Only one pairing window can be open at a time
- Opening a new window resets the timer
- Server restart closes any open window (in-memory only)

---

### NVS Layout (Node firmware — Preferences namespace `"anthos"`)

| Key | Type | Set when |
|---|---|---|
| `wifi_ssid` | String | After BLE provisioning |
| `wifi_pass` | String | After BLE provisioning |
| `server_url` | String | After mDNS resolution or manual entry |
| `node_id` | String | After hub registration |

**First-boot detection:** `wifi_ssid` key absent → enter BLE provisioning mode.  
**Factory reset:** Clear all keys in `"anthos"` namespace → restart.

---

## State Transitions

### Node Boot State Machine

```
Boot
 │
 ├─ NVS has wifi_ssid? ──No──▶ [BLE Provisioning Mode]
 │                                      │
 │                              Credentials received
 │                                      │
 │                              WiFi connect attempt
 │                                      │
 │                    ┌─── success ────▶ [Hub Registration]
 │                    │                         │
 │                    │              Has node_id in NVS?
 │                    │              ├── Yes ──▶ [Telemetry Loop]
 │                    │              └── No ───▶ POST /api/register
 │                    │                                  │
 │                    │                         Pairing window open?
 │                    │                         ├── Yes → assign node_id → NVS → [Telemetry Loop]
 │                    │                         └── No  → retry on interval
 │                    │
 │                    └─── failure ───▶ BLE notify "failed" → BLE close → retry
 │
 └─ NVS has wifi_ssid, has node_id? ──▶ [Telemetry Loop]
```

### LogicalNode Claim Status

```
[registered] → claim_status: 'unclaimed'
                      │
              User assigns display_name
                      │
              claim_status: 'claimed'
```

---

## ID Generation

`node_id` is generated server-side as a zero-padded counter:

```typescript
// Pseudo-code — uses MAX to avoid collision if rows are ever deleted
const result = db.exec(
  "SELECT COALESCE(MAX(CAST(REPLACE(node_id,'node-','') AS INTEGER)), 0) FROM logical_nodes"
);
const next = Number(result[0].values[0][0]) + 1;
const nodeId = `node-${String(next).padStart(3, '0')}`;
// → "node-001", "node-002", etc. — safe even if earlier rows are deleted
```

Simple and human-readable. Not a UUID — intentional, matches the project's ethos of clarity over abstraction.
