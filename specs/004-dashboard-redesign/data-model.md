# Data Model: Dashboard Design Integration

**Phase**: 1 - Design  
**Date**: 2026-04-07

## Entities

### Biological Node (LogicalNodeRecord)

Represents a registered sensor node in the Anthos system.

| Field | Type | Description |
|-------|------|-------------|
| nodeId | string | Unique identifier (e.g., "node-001") |
| hwId | string | Hardware ID from ESP32 |
| displayName | string | User-friendly name |
| claimStatus | 'claimed' \| 'unclaimed' | Registration state |
| location | string (optional) | Room/location label |
| createdAt | timestamp | Registration time |

### Sensor Reading (SensorSample)

Current sensor values from a node.

| Field | Type | Description |
|-------|------|-------------|
| type | 'temperature' \| 'humidity' \| 'light' \| 'soilMoisture' | Sensor type |
| value | number | Current reading |
| unit | string | Unit of measurement |
| timestamp | timestamp | Reading time |

### Node Health (NodeHealthPayload)

Infrastructure health metrics for a node.

| Field | Type | Description |
|-------|------|-------------|
| rssi | number | WiFi signal strength (dBm) |
| ip | string | IP address |
| uptimeMs | number | Uptime in milliseconds |
| pressure | number (optional) | Barometric pressure |

### System Health (Aggregate)

Dashboard-level health metrics (computed).

| Field | Type | Description |
|-------|------|-------------|
| meshSignal | number | Average mesh signal strength (%) |
| cpuLoad | number | Hub CPU utilization (%) |
| storageUsed | number | Storage used (TB) |
| storageTotal | number | Total storage (TB) |

### Activity Event

System event log entry.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | string | ISO timestamp |
| source | string | Event origin (node ID or system) |
| level | 'info' \| 'warning' \| 'error' \| 'critical' | Severity level |
| message | string | Event description |

## Data Flow

```
API (/api/nodes) → NodesStore → DashboardView
API (/api/readings) → TelemetryStore → NodeCard
```

## Validation Rules

- Node IDs follow pattern: `node-XXX` (zero-padded)
- Sensor values within valid ranges:
  - Temperature: -40°C to 80°C
  - Humidity: 0% to 100%
  - Light: 0 to 100,000 LUX
  - Soil Moisture: 0% to 100%
- RSSI values: -100 to 0 dBm

## State Transitions

- Node status: `unknown` → `connected` | `disconnected`
- Claim status: `unclaimed` → `claimed` (via claimNode)
- Event level: `info` → `warning` → `error` → `critical`