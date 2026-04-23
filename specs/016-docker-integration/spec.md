# Feature Specification: Docker Integration

**Feature Branch**: `016-docker-integration`  
**Created**: 2026-04-23  
**Status**: Draft  
**Input**: User description: "let's start on the docker integration, which is the next feature on our roadmap. nyx-notes (../nyx-notes) already has the integration and probably also a spec folder for that feature, to template off of. I will host anthos on my nas in the same way that I do nyx-notes, so most things should be identical, other than the package name."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - NAS Deployment Setup (Priority: P1)

An operator can deploy Anthos on a NAS using the documented container setup and reach the app through the usual browser entry point.

**Why this priority**: A working NAS deployment is the main goal of the feature and unlocks real home use.

**Independent Test**: Follow the deployment guide on a clean NAS environment and confirm the app opens and responds normally.

**Acceptance Scenarios**:

1. **Given** a clean NAS host with the required runtime available, **When** the operator starts Anthos using the documented container setup, **Then** the app becomes available from a browser.
2. **Given** the service is running on the NAS, **When** a user opens the app endpoint, **Then** the dashboard and API both respond from the same deployment.

---

### User Story 2 - Persistent Data (Priority: P2)

An operator keeps Anthos data on the NAS so restarts and redeployments do not erase existing nodes, readings, or configuration.

**Why this priority**: A NAS deployment is only useful if it survives normal maintenance without data loss.

**Independent Test**: Create or update data, restart or replace the running container, and confirm the same data is still present.

**Acceptance Scenarios**:

1. **Given** Anthos has stored data on the NAS, **When** the container is restarted, **Then** the existing data remains available.
2. **Given** Anthos is redeployed with the same mounted storage, **When** the new instance starts, **Then** it continues using the previously stored data and settings.

---

### User Story 3 - Repeatable Upgrades (Priority: P3)

An operator can update Anthos to a newer release without redesigning their NAS setup each time.

**Why this priority**: Updates must be routine and low-friction so the deployment stays maintainable.

**Independent Test**: Apply a newer release to an existing NAS installation and verify the service returns to a working state with the same stored data.

**Acceptance Scenarios**:

1. **Given** an existing NAS installation is running, **When** the operator updates to a newer release using the documented process, **Then** the service starts successfully with the same persistent data.
2. **Given** an operator follows the deployment instructions again for the same environment, **When** they compare the setup steps, **Then** the process remains predictable and does not require manual recovery.

---

### Edge Cases

- The NAS starts with an empty data directory.
- The configured storage location is missing or not writable.
- The deployment port is already in use on the host.
- A restart happens while nodes are actively sending data.
- A new release is deployed while existing data is still present.
- The operator restores the NAS from a backup after a failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support a single-container deployment for Anthos that can run on a NAS.
- **FR-002**: The system MUST make the existing app and API available from that deployment.
- **FR-003**: The system MUST preserve runtime data across restarts and redeployments when the same host storage is reused.
- **FR-004**: The system MUST provide a documented way to configure the storage location used by the deployment.
- **FR-005**: The system MUST provide a documented way to configure the exposed host port used to access the service.
- **FR-006**: The system MUST allow an operator to update to a newer release without losing existing stored data.
- **FR-007**: The system MUST fail with a clear operator-facing error when required storage is unavailable or not writable.
- **FR-008**: The system MUST provide deployment instructions suitable for a home NAS environment.
- **FR-009**: The system MUST use stable deployment naming and release labeling that clearly identify Anthos to operators.

### Key Entities *(include if feature involves data)*

- **Deployment Package**: The distributable form of Anthos intended for NAS use.
- **Persistent Storage**: The host-mounted location that retains Anthos data between runs.
- **Runtime Configuration**: The operator-provided settings that control access, storage, and startup behavior.
- **Release Version**: A named release of Anthos used for repeatable upgrades.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time operator can complete the documented NAS deployment and open Anthos in under 15 minutes.
- **SC-002**: 100% of restart tests preserve existing Anthos data when the same persistent storage is reused.
- **SC-003**: 95% of upgrade tests complete without manual recovery or data restoration.
- **SC-004**: At least 90% of operators can follow the deployment guide without needing extra clarification.
- **SC-005**: Anthos remains available after a routine restart in a 7-day soak test with no data loss.

## Assumptions

- Anthos will be hosted on a trusted home NAS or equivalent private environment.
- The deployment will present the web experience and API from the same service entry point.
- Persistent data already lives on a NAS-mounted host path rather than inside the container.
- The mobile or desktop app packaging is out of scope for this feature.

## Dependencies

- The production server already serves the built app alongside the API.
- A writable host directory is available for persistent Anthos data.
- The deployment pattern follows the same NAS-hosting approach already used for `nyx-notes`.
