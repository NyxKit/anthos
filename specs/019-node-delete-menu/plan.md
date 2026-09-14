# Implementation Plan: Node Actions Menu

**Branch**: `019-node-delete-menu` | **Date**: 2026-04-30 | **Spec**: `/home/arnedecant/Projects/nyxkit/anthos/specs/019-node-delete-menu/spec.md`
**Input**: Feature specification from `/specs/019-node-delete-menu/spec.md`

## Summary

Add a three-dot node actions menu that is always available, replace the current edit button with that menu, and add node deletion with a warning that the hardware must still be manually reset. Deletion should remove the logical node record but preserve hardware tracking so telemetry from the same device can recreate the node later.

## Technical Context

**Language/Version**: TypeScript 5.8 + Vue 3.5 for the app, TypeScript 5.8 + Express for the API  
**Primary Dependencies**: nyx-kit, Pinia, Vue Router, sql.js, Vitest  
**Storage**: SQLite via sql.js in the API; no new storage layer  
**Testing**: Vitest for app and API tests  
**Target Platform**: Desktop app shell + API server  
**Project Type**: Monorepo web application with backend API and frontend UI  
**Performance Goals**: The actions menu should be available immediately for every node, including offline nodes, and delete should complete in one request/response cycle  
**Constraints**: Delete must remain available when a node is offline; existing edit behavior stays intact; telemetry-driven re-registration must continue to work after deletion  
**Scale/Scope**: Existing node list, registry tables, and node card actions only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Pass: The feature is specified before implementation and documented in `specs/`.
- Pass: Tests will be written before code changes in both API and app layers.
- Pass: Shared node values stay in the existing shared contracts; no ad hoc string handling is introduced.
- Pass: SQL changes, if any, remain readable and localized to the registry service.

## Project Structure

### Documentation (this feature)

```text
specs/019-node-delete-menu/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
app/src/dashboard/components/NodeCardActions.vue
app/src/dashboard/composables/useNodeCardEditState.ts
app/src/nodes/stores/nodes.ts
app/src/dashboard/components/NodeCard.test.ts
app/src/dashboard/components/NodeCardActions.test.ts

server/api/src/controllers/ProvisionController.ts
server/api/src/routes/createApiRouter.ts
server/api/src/services/NodeRegistryService.ts
server/api/tests/provision.controller.test.ts
server/api/tests/node-registry.service.test.ts

specs/019-node-delete-menu/contracts/nodes-api.md
```

**Structure Decision**: Keep the feature inside the existing app/API split. The API owns the delete behavior, the store exposes the new action, and `NodeCardActions.vue` owns the UI entry point and confirmation flow.

## Complexity Tracking

None.
