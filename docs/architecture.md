# Architecture

## Current Direction

- nodes push readings to the server
- the server does not poll nodes for normal telemetry ingestion
- the server is an all-in-one app that both ingests telemetry and serves the dashboard
- the server stack is fully TypeScript
- the server can run on any always-on Docker-capable host (`NAS`, `Pi`, mini PC, desktop)
- `Raspberry Pi` is an optional deployment target, not a hard requirement

## Why Push Instead Of Poll

- the nodes already know when they have fresh readings
- node push is simpler on home networks than server-initiated polling
- polling many small Wi-Fi devices adds more connection/state complexity on the server side
- push aligns better with intermittent connectivity and local retry behavior on the node
- this matches the current firmware direction: node health, sensor availability, and later publish logic live on the node

## Expected Data Flow

```text
Atom node
  -> sample sensors
  -> build payload
  -> POST payload to server ingestion endpoint
  -> retry on failure / keep local runtime health state

Server
  -> accept reading payloads
  -> validate node identity and payload shape
  -> store readings
  -> expose data to dashboard/API
  -> serve the dashboard UI to browsers on the local network
```

## Node Responsibilities

- manage sensor initialization and tolerate missing modules cleanly
- maintain Wi-Fi connectivity
- track runtime health (`uptime`, `wifi`, `server reachability`)
- publish readings to the server when the API is available
- continue operating even when some sensors are absent or failing

## Server Responsibilities

- expose a lightweight ingestion API
- accept node-pushed telemetry
- store readings with node identity and timestamps
- provide dashboard/backend access to stored readings
- serve a browser-accessible dashboard from the same application
- later support node registry, health visibility, and diagnostics

## Server Shape

The first server should be a single deployable application that does both:

- node ingestion API
- human-facing dashboard UI

Planned stack:

- Node.js + TypeScript backend
- Vue frontend
- `Nyx Kit` as the Vue component library
- one Dockerized deployment for local hosting

Example shape:

- `GET /` -> dashboard
- `GET /api/...` -> dashboard/backend data endpoints
- `POST /api/ingest` -> node telemetry ingestion

Current local development default:

- shared local config should expose `ANTHOS_API_HOST` and `ANTHOS_API_PORT`
- server origin: `http://<lan-ip>:<api-port>`
- ingest endpoint: `http://<lan-ip>:<api-port>/api/ingest`

This keeps deployment simple on a `NAS`, `Pi`, or other Docker host while the product is still early.

## Backend Framework

Recommended backend framework: `Express`

Why `Express` fits this project:

- extremely common and well-understood
- fits a minimal-library approach well
- easy to keep object-oriented and structurally organized without committing to a heavy framework
- good fit for serving both an ingestion API and a built Vue frontend
- large ecosystem for auth, validation, and deployment needs when they are actually needed

Planned shape:

- `server/api/` for Express backend code
- `server/web/` for Vue app code
- `server/shared/` for TypeScript types shared across backend and frontend
- backend serves the built frontend in production

Implementation style:

- object-oriented service classes where stateful behavior exists
- structural module boundaries instead of framework-heavy abstractions
- minimal dependencies until the product needs more
- shared payload and domain types in `server/shared/`

## Remote Access

- local-network access is the first target
- future remote access through router port forwarding is possible
- authentication should be added before exposing the server outside the home network
- HTTPS should be considered mandatory before public exposure
- node ingestion should also be authenticated, not left as an open endpoint forever

## Database & Storage

The server uses **SQLite** (via `sql.js` - WASM-based, no native dependencies) to store telemetry readings.

### Storage Strategy

Nodes push readings at **1-second intervals** for real-time dashboard updates. However, we don't store every single reading to the DB - that would create ~86K rows per day per node.

Instead:
- **1s**: Node pushes readings → Server keeps in memory buffer
- **60s**: Server computes average of buffered readings per sensor type → stores to SQLite

This gives you:
- Real-time updates on the dashboard (1s resolution)
- Efficient storage (1 row per sensor type per minute = ~5K rows/day)
- Still plenty of data for graphs and trends

### Schema

```sql
readings (
  id INTEGER PRIMARY KEY,
  node_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  sensor_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL
)

-- index for time-range queries
INDEX idx_readings_node_time ON readings(node_id, timestamp)
```

### Data Location

- Database: `server/db/anthos.db` (gitignored)
- Runtime logs: `server/api/logs/` (gitignored)

## Hardware Findings That Affect Architecture

- `M5Stack AtomS3 Lite` is the controller in use; do not assume `Atom Lite` docs or examples are interchangeable
- `Ambient Light Sensor Unit` and `ENV-*` units are `I2C` devices
- `Earth Unit` is `analog + digital`, not `I2C`
- `Earth Unit` does not cleanly fit the same passive shared-hub path as the `I2C` units
- sensor absence must be handled as a normal runtime condition, not as a fatal error

## Immediate Next Steps

1. add an HTTP client on the node
2. define the first ingestion payload shape
3. scaffold the server API in `server/`
4. receive pushed telemetry locally on your dev machine or NAS-hosted container
5. persist readings and expose a minimal inspection view

## First Payload Shape

An initial payload can stay simple:

```json
{
  "nodeId": "dev-node",
  "timestamp": 1710000000,
  "health": {
    "wifi": "connected",
    "server": "reachable",
    "uptimeMs": 12345
  },
  "sensors": [
    {
      "sensor": "dlight",
      "metric": "lux",
      "value": 85.0
    }
  ]
}
```

This can expand later for `ENV-*`, moisture, calibration state, and diagnostics.
