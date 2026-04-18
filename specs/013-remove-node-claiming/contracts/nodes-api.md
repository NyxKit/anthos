# Node API Contract

## Overview
The node management API exposes registration, listing, naming, capability updates, ordering, power profile management, commands, and telemetry.

## Kept Endpoints
- `GET /api/nodes`
- `PATCH /api/nodes/:id/name`
- `PATCH /api/nodes/:id/capability`
- `PATCH /api/nodes/:id/order`
- `GET /api/nodes/:id/power-profile`
- `PATCH /api/nodes/:id/power-profile`
- `POST /api/register`
- `POST /api/provision/open`

## Removed Claim Endpoints and Fields
- `PATCH /api/nodes/:id` is removed.
- `claimStatus` is removed from node-facing payloads.
- Claim-oriented request and response shapes are removed from shared client contracts.

## Expected Node Shape
- `nodeId`
- `hwId`
- `displayName` or empty value
- `capability`
- `order`
- `registeredAt`
- `powerProfile`

## Notes
- The API must not expose unclaimed/claimed state in any node management response.
- Legacy records may still exist in storage, but the public contract should present the simplified model only.
