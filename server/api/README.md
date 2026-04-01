# API

This package will host the Node.js + Express backend.

Initial responsibilities:

- ingest node telemetry
- validate payloads
- persist readings
- expose dashboard/backend endpoints
- serve the built frontend in production

Current structure:

- `src/app.ts` - Express app composition
- `src/server.ts` - process entrypoint
- `src/routes/` - route wiring
- `src/controllers/` - HTTP controllers
- `src/services/` - business logic

Shared contracts should be imported from `server/shared/src/` until a dedicated shared package build is introduced.

Local development default:

- API binds to `0.0.0.0` by default
- API port defaults to `ANTHOS_API_PORT` from the shared root local config, falling back to `8088`

Telemetry verification:

- accepted payloads are appended to `server/api/logs/telemetry.ndjson`
- latest in-memory payload is exposed at `GET /api/telemetry/latest`
