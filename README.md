# Anthos

This repository is split into product areas so hardware, backend, and later UI can evolve independently.

## Structure

- `docs/` - research, roadmap, and planning documents
- `node/` - firmware for the `M5Stack AtomS3 Lite` nodes
- `server/` - backend service and, later, frontend code

## Current Status

- `node/` contains the first `PlatformIO` project for the Atom
- `server/` is reserved for the local development server

## Next Steps

1. Build and flash the firmware in `node/`.
2. Verify serial output from the Atom.
3. Add the first sensor read path.
4. Start the server work in `server/`.
