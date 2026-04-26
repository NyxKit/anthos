# Docker Deployment

Anthos ships as a single container for home NAS use. The container serves the API and the built dashboard from one process.

## How it works

```text
Container
  -> serves /api/* from the Anthos server
  -> serves the built dashboard from the same app
  -> stores data on a mounted host directory
```

## Runtime behavior

- `ANTHOS_STATIC_DIR` points to the built dashboard files inside the container.
- `ANTHOS_DATA_DIR` points to the mounted storage root.
- `ANTHOS_DB_PATH` keeps the database on persistent storage.
- `ANTHOS_LOG_DIR` keeps log archives on persistent storage.
- `ANTHOS_ENABLE_MDNS=false` disables multicast advertising in container environments.

## Build

```sh
docker build -t ghcr.io/nyxkit/anthos .
```

Release images are published from the GitHub Actions workflow to GHCR. A tag push like `v1.2.3` publishes `ghcr.io/nyxkit/anthos:1.2.3`, `:1.2`, and `:1`, while `main` continues to refresh `:latest`.

## Run

```yaml
services:
  anthos:
    image: ghcr.io/nyxkit/anthos:latest
    ports:
      - "8088:8088"
    volumes:
      - /your/nas/path/anthos:/data
    environment:
      ANTHOS_DATA_DIR: /data
      ANTHOS_DB_PATH: /data/anthos.db
      ANTHOS_LOG_DIR: /data/logs
      ANTHOS_STATIC_DIR: /app/dist
      ANTHOS_ENABLE_MDNS: "false"
```

## Persistent data

- Database: `/data/anthos.db`
- Logs: `/data/logs`
- Keeping the same mounted path preserves nodes, readings, and logs across restarts.

## Upgrade flow

1. Stop the existing container.
2. Pull or build the newer image.
3. Start the new container with the same mounted storage.
4. Confirm the dashboard opens and prior data is still present.

If you want Docker update checkers to report an available upgrade, run the container from a registry tag such as `:latest` or `:1.2.3`. Avoid digest-pinned images unless you want to suppress update detection.

## Release flow

Run the manual GitHub Actions workflow with a version like `v1.2.3`. It creates and pushes the git tag, creates the GitHub Release, and the Docker workflow publishes the matching image tags.

## Notes

- This deployment pattern intentionally matches the NAS hosting style already used by `nyx-notes`.
- The image name should clearly identify Anthos for operators and registries.
