# Research Notes: Docker Integration

## Decision 1: Single-container deployment

**Decision**: Use one container for Anthos that serves the API and the built web app together.

**Rationale**: The current server already serves `app/dist` alongside `/api`, so the deployment can mirror the existing runtime model without splitting responsibilities across multiple services.

**Alternatives considered**:
- Separate web and API containers. Rejected because it adds orchestration overhead without improving the current home NAS use case.
- Static hosting plus API container. Rejected because the app already ships as one server-facing product.

## Decision 2: Persistent NAS storage

**Decision**: Treat a host-mounted directory as the source of truth for data and runtime state across restarts.

**Rationale**: The feature goal is to run Anthos on a NAS in the same way as `nyx-notes`, so preserving storage on the host is the key reliability requirement.

**Alternatives considered**:
- Container-local storage. Rejected because it would lose data on redeploy.
- Managed external database. Rejected because it would complicate a simple home deployment.

## Decision 3: Deployment documentation first

**Decision**: Capture the Docker flow as spec-driven documentation and quickstart steps before implementation work.

**Rationale**: This keeps the deployment behavior aligned with the current product shape and gives a clear target for the later build work.

**Alternatives considered**:
- Implementing the container immediately. Rejected because the planning workflow requires a documented design first.

## Decision 4: No formal interface contracts

**Decision**: Skip `/contracts/` for this feature.

**Rationale**: Docker integration does not introduce a new public API, CLI, or protocol contract; it mainly defines deployment and runtime expectations.

**Alternatives considered**:
- Adding a container contract. Rejected because the deployment guide and quickstart are sufficient for this scope.

## Decision 5: NAS-hosted parity with `nyx-notes`

**Decision**: Align Anthos deployment behavior with the `nyx-notes` NAS pattern, changing only the package/image identity and Anthos-specific paths.

**Rationale**: The user explicitly wants the same hosting model, which reduces setup friction and keeps operations familiar.

**Alternatives considered**:
- Designing a new Anthos-specific deployment style. Rejected because it would create unnecessary divergence from the known-good pattern.
