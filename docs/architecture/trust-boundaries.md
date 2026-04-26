# Trust Boundaries

Anthos treats HTTP endpoints as belonging to different trust domains. Public browser traffic, authenticated user traffic, and node/device traffic are not interchangeable.

## Principle

- browser-facing reads can be open when they are safe to expose
- user actions must require session authentication and role checks
- node write paths must require device identity, not just payload shape
- CORS is an origin policy, not an authentication layer
- a body field like `hwId` identifies a device record, not a caller

## Why This Matters

If the server accepts mutations from any caller that can reach the port, then telemetry, logs, registrations, and automation become spoofable. That turns the control plane into a shared input sink instead of a system with explicit ownership.

## Anthos Application

For Anthos, the minimum safe split is:

- public reads: dashboard data, health checks, archive views
- authenticated users: provisioning, node management, admin actions
- authenticated devices: telemetry, log writes, registration

## Practical Rule

Every write endpoint should answer two questions:

1. who is calling?
2. are they allowed to mutate this specific resource?

If either answer is missing, the endpoint is too open.
