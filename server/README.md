# Server

This directory contains the TypeScript server stack.

Planned layout:

- `server/api/` - Node.js + Express backend
- `server/web/` - Vue frontend
- `server/shared/` - TypeScript types shared by API and web

Design direction:

- one deployable server that both ingests node telemetry and serves the dashboard
- object-oriented backend structure with minimal libraries
- shared contracts for telemetry payloads and domain models
