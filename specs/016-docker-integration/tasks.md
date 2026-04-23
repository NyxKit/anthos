# Tasks: Docker Integration

**Input**: Design documents from `/specs/016-docker-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested for this feature, so implementation tasks focus on deployment, packaging, and documentation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the container delivery artifacts and deployment documentation baseline

- [X] T001 Create repository-root `Dockerfile` for the single-container Anthos deployment at `/home/arnedecant/Projects/nyxkit/anthos/Dockerfile`
- [X] T002 Create a Docker ignore file for build hygiene at `/home/arnedecant/Projects/nyxkit/anthos/.dockerignore`
- [X] T003 [P] Add a NAS deployment example and runtime notes to `/home/arnedecant/Projects/nyxkit/anthos/docs/architecture.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core container behavior that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add container startup configuration and environment handling to `/home/arnedecant/Projects/nyxkit/anthos/server/api/src/app.ts`
- [X] T005 Ensure persistent database and runtime storage paths are resolved from mounted storage in `/home/arnedecant/Projects/nyxkit/anthos/server/api/src/services/TelemetryService.ts`
- [X] T006 Add a container-focused package build path for the frontend output in `/home/arnedecant/Projects/nyxkit/anthos/app/package.json`
- [X] T007 Create the Docker build-and-publish workflow at `/home/arnedecant/Projects/nyxkit/anthos/.github/workflows/docker.yml`
- [X] T008 Document the NAS deployment flow in `/home/arnedecant/Projects/nyxkit/anthos/docs/roadmap.md` so the roadmap matches the Docker feature scope

**Checkpoint**: The project can now be packaged and started as a single NAS-hosted service

---

## Phase 3: User Story 1 - NAS Deployment Setup (Priority: P1) 🎯 MVP

**Goal**: Let an operator run Anthos on a NAS and open the app from a browser using the documented container setup

**Independent Test**: Build the image, start it on a NAS-like host with a mounted data directory, and confirm the dashboard and API are reachable from the same service address

### Implementation for User Story 1

- [X] T009 [US1] Add the repository-root container entry instructions to `/home/arnedecant/Projects/nyxkit/anthos/README.md`
- [X] T010 [P] [US1] Add a concise Docker deployment guide at `/home/arnedecant/Projects/nyxkit/anthos/docs/architecture/docker.md`
- [X] T011 [US1] Align the server production startup so the built frontend and API are served from one process in `/home/arnedecant/Projects/nyxkit/anthos/server/api/src/app.ts`

**Checkpoint**: Anthos can be deployed on a NAS and opened in a browser as a single service

---

## Phase 4: User Story 2 - Persistent Data (Priority: P2)

**Goal**: Keep Anthos data on the NAS so restarts and redeployments do not erase nodes, readings, or configuration

**Independent Test**: Create data, restart or replace the container, and confirm the same records remain available from the mounted storage

### Implementation for User Story 2

- [X] T012 [US2] Make the database location and writable data directory explicit in `/home/arnedecant/Projects/nyxkit/anthos/server/api/src/services/TelemetryService.ts`
- [X] T013 [P] [US2] Document the persistent storage mount and backup expectations in `/home/arnedecant/Projects/nyxkit/anthos/docs/architecture/docker.md`
- [X] T014 [US2] Add upgrade-safe storage guidance to `/home/arnedecant/Projects/nyxkit/anthos/specs/016-docker-integration/quickstart.md`

**Checkpoint**: Data survives restarts and redeployments when the same NAS storage is reused

---

## Phase 5: User Story 3 - Repeatable Upgrades (Priority: P3)

**Goal**: Let an operator move to a newer Anthos release without redesigning their NAS setup

**Independent Test**: Update an existing installation to a newer release and verify the service returns with the same stored data and a stable operator-facing deployment name

### Implementation for User Story 3

- [X] T015 [US3] Add repeatable upgrade instructions and image update notes to `/home/arnedecant/Projects/nyxkit/anthos/docs/architecture/docker.md`
- [X] T016 [P] [US3] Align the release naming and operator-facing image labels in `/home/arnedecant/Projects/nyxkit/anthos/Dockerfile`
- [X] T017 [US3] Add redeployment and upgrade verification steps to `/home/arnedecant/Projects/nyxkit/anthos/specs/016-docker-integration/quickstart.md`

**Checkpoint**: An existing NAS installation can be updated predictably without data loss

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation cleanup and deployment hardening that spans multiple stories

- [X] T018 [P] Finalize the container deployment narrative across `/home/arnedecant/Projects/nyxkit/anthos/docs/architecture.md` and `/home/arnedecant/Projects/nyxkit/anthos/docs/architecture/docker.md`
- [X] T019 Validate the quickstart flow against `/home/arnedecant/Projects/nyxkit/anthos/specs/016-docker-integration/quickstart.md`
- [X] T020 Confirm the Docker feature docs and roadmap references are consistent in `/home/arnedecant/Projects/nyxkit/anthos/docs/roadmap.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational phase - should preserve the same deployment shape as US1
- **User Story 3 (P3)**: Can start after Foundational phase - builds on the same packaging and storage model

### Within Each User Story

- Complete deployment docs before polishing related guidance
- Configure runtime and storage behavior before upgrade instructions
- Keep the story independently deployable and verifiable

### Parallel Opportunities

- T003 can run in parallel with T001-T002 because it only updates docs
- T010 can run in parallel with T009 because it updates a different file
- T013 can run in parallel with T012 because it updates docs while storage code is adjusted
- T016 can run in parallel with T015 because it updates the Docker packaging label separately

---

## Parallel Example: User Story 1

```bash
Task: "Add a concise Docker deployment guide at /home/arnedecant/Projects/nyxkit/anthos/docs/architecture/docker.md"
Task: "Add the repository-root container entry instructions to /home/arnedecant/Projects/nyxkit/anthos/README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate that Anthos starts on the NAS and loads in a browser

### Incremental Delivery

1. Setup + Foundational establish the package and runtime baseline
2. Add User Story 1 to make Anthos deployable on a NAS
3. Add User Story 2 to make restarts and redeployments safe
4. Add User Story 3 to make upgrades repeatable and predictable

### Parallel Team Strategy

1. One developer can own the container packaging files
2. Another can own the deployment documentation
3. Another can own storage and upgrade behavior once the foundation is ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and verifiable
- Avoid vague tasks and cross-story dependencies that break deployment independence
