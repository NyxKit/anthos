# syntax=docker/dockerfile:1

FROM node:20-slim AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/package.json app/package.json
COPY server/api/package.json server/api/package.json
COPY shared/package.json shared/package.json

RUN pnpm install --frozen-lockfile

COPY app app
COPY server/api server/api
COPY shared shared

RUN pnpm --dir app build:docker

FROM node:20-slim AS runtime

WORKDIR /app/server/api

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8088
ENV ANTHOS_API_PORT=8088
ENV ANTHOS_ENABLE_MDNS=false
ENV ANTHOS_DATA_DIR=/data
ENV ANTHOS_DB_PATH=/data/anthos.db
ENV ANTHOS_LOG_DIR=/data/logs
ENV ANTHOS_STATIC_DIR=/app/dist

RUN corepack enable

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=build /app/app /app/app
COPY --from=build /app/server /app/server
COPY --from=build /app/shared /app/shared
COPY --from=build /app/app/dist /app/dist

VOLUME ["/data"]
EXPOSE 8088

CMD ["node", "--import", "tsx", "src/server.ts"]
