# Data Model: Telemetry Dashboard

## Entities

### Node
Represents the sensor node pushing telemetry data.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique node identifier |
| name | string | Display name for the node |
| status | enum | Connection status: `connected`, `disconnected`, `unknown` |
| lastSeen | timestamp | Last time data was received |

### Sensor Reading
A single measurement from a sensor.

| Field | Type | Description |
|-------|------|-------------|
| nodeId | string | Reference to the node |
| timestamp | number | Unix timestamp of reading |
| sensor | string | Sensor type identifier |
| metric | string | Metric name (e.g., lux, celsius, percent) |
| value | number | The measured value |
| unit | string | Unit of measurement |

### Dashboard State (Pinia Store)
Aggregated state for the dashboard view.

| Field | Type | Description |
|-------|------|-------------|
| node | Node | Current node data |
| readings | SensorReading[] | Latest readings from all sensors |
| isLoading | boolean | Loading state |
| error | string | Error message if API fails |
| lastUpdated | timestamp | Last successful data fetch |

## API Contract

### GET /api/readings
Returns the latest sensor readings.

Response:
```json
{
  "node": {
    "id": "dev-node",
    "name": "Development Node",
    "status": "connected",
    "lastSeen": 1712240000
  },
  "readings": [
    {
      "nodeId": "dev-node",
      "timestamp": 1712240000,
      "sensor": "dlight",
      "metric": "lux",
      "value": 85.0,
      "unit": "lux"
    }
  ]
}
```

## State Transitions

1. **Initial**: `isLoading: false`, `error: null`, `readings: []`
2. **Loading**: `isLoading: true`
3. **Success**: `isLoading: false`, `readings: [data]`, `error: null`
4. **Error**: `isLoading: false`, `error: [message]`
5. **Disconnected**: After 30s without data, status → `disconnected`
