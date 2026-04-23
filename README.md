# Anthos

Anthos is a home monitoring platform for M5Stack AtomS3 Lite nodes, a TypeScript server, and a Vue dashboard. It is designed to run on a local network first, with a single-container Docker deployment for NAS hosting.

## What’s In The Repo

- `node/` - firmware for the AtomS3 Lite nodes
- `server/` - backend API and production server
- `app/` - Vue/Tauri frontend
- `shared/` - shared TypeScript contracts and domain types
- `docs/` - architecture notes, roadmap, and feature specs
- `specs/` - spec-first feature plans

## Current Status

- Node firmware is in place and ready for sensor work.
- The server serves the API and built frontend from one deployment.
- Docker support is available for NAS hosting.

## Requirements

- Node.js 20+
- pnpm
- PlatformIO for firmware work
- Docker for NAS or local container deployment

## Local Development

Install dependencies:

```sh
pnpm install
```

Run the API server:

```sh
pnpm --filter @anthos/api dev
```

Run the frontend:

```sh
pnpm --filter anthos-app dev
```

Build the frontend:

```sh
pnpm --filter anthos-app build
```

Build the API:

```sh
pnpm --filter @anthos/api build
```

## Docker Quickstart

1. Create a host directory for Anthos data, for example `/your/nas/path/anthos`.
2. Build the image:

```sh
docker build -t ghcr.io/nyxkit/anthos .
```

3. Run the container:

```sh
docker run --rm -p 8088:8088 -v /your/nas/path/anthos:/data ghcr.io/nyxkit/anthos
```

4. Open `http://<nas-ip>:8088` in a browser.
5. Keep using the same `/data` mount so data survives restarts and upgrades.

## Firmware

Build the node firmware:

```sh
pnpm node:build
```

Flash the connected node:

```sh
pnpm node:flash
```

Monitor serial output:

```sh
pnpm node:monitor
```

## Documentation

- `docs/architecture.md` - system shape and runtime decisions
- `docs/architecture/docker.md` - container deployment details
- `docs/roadmap.md` - feature priorities
- `specs/` - feature-specific specs, plans, and task lists

## Roadmap

The current roadmap starts with Docker integration, node power profile work, and mobile pairing support.

## Next Steps

1. Finish the first sensor read path.
2. Expand node health reporting.
3. Keep the Docker deployment simple and repeatable for NAS use.
