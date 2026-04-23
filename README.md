# Anthos

This repository is split into product areas so hardware, backend, and later UI can evolve independently.

## Structure

- `docs/` - research, roadmap, and planning documents
- `node/` - firmware for the `M5Stack AtomS3 Lite` nodes
- `server/` - backend service and, later, frontend code

## Current Status

- `node/` contains the first `PlatformIO` project for the Atom
- `server/` is reserved for the local development server

## Docker

Anthos can now be deployed as a single container on a NAS or other Docker-capable host.

```sh
docker build -t ghcr.io/nyxkit/anthos .
docker run --rm -p 8088:8088 -v /your/nas/path/anthos:/data ghcr.io/nyxkit/anthos
```

Use `/data` as the persistent mount so readings, nodes, and logs survive restarts.

## Quickstart Docker

1. Create a host folder for Anthos data, for example `/your/nas/path/anthos`.
2. Build the image with `docker build -t ghcr.io/nyxkit/anthos .`.
3. Run the container with `docker run --rm -p 8088:8088 -v /your/nas/path/anthos:/data ghcr.io/nyxkit/anthos`.
4. Open `http://<nas-ip>:8088` in a browser.
5. Keep using the same `/data` mount so data survives restarts and upgrades.

## Next Steps

1. Build and flash the firmware in `node/`.
2. Verify serial output from the Atom.
3. Add the first sensor read path.
4. Start the server work in `server/`.
5. Use the Docker image for NAS deployment once the server is running.
