# Quickstart: Docker Integration

## Prerequisites

- A Docker-capable NAS or home Linux host.
- A writable host directory for Anthos data.
- Access to the Anthos repository.

## Build

1. Install workspace dependencies.
2. Build the Anthos container image from the repository root.
3. Confirm the image is tagged for your registry or local host.

## Run

1. Create a host directory for persistent data.
2. Start the container with the host directory mounted into the data path.
3. Map port `8088` to a host port that is free on the NAS.
4. Open the browser at the NAS address and confirm the dashboard loads.

## Upgrade

1. Stop the existing container.
2. Pull or build the newer Anthos release.
3. Start the new container with the same mounted storage.
4. Confirm existing nodes, readings, and configuration are still present.

## Verification

- The app loads from the NAS browser address.
- API routes respond from the same deployment.
- Data remains after a restart.
- A new release starts successfully with the same storage.
- Logs remain available after a restart or upgrade.
