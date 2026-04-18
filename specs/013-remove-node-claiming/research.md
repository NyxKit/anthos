# Research: Remove Node Claiming

## Decision 1: Remove claim state from the shared node model
- Decision: The node model will no longer expose claim status as a user-facing concept.
- Rationale: The feature goal is to eliminate claim-related traces, not just hide them in the UI.
- Alternatives considered: Keep claim status internally for compatibility, or rename it without changing behavior.

## Decision 2: Delete claim-specific API routes and client methods
- Decision: The API contract will drop claim-only endpoints and the shared client surface will stop exposing claim actions.
- Rationale: Leaving the endpoints in place would preserve a dead-end workflow and violate the hard-cleanup intent.
- Alternatives considered: Retain legacy endpoints behind hidden UI, or map them to no-op behavior.

## Decision 3: Migrate existing records into the simplified node shape
- Decision: Existing node rows will be preserved, but only the non-claim fields required by the simplified model will remain relevant.
- Rationale: The product must keep historical nodes visible while removing claim-only state.
- Alternatives considered: Delete legacy rows, or keep legacy claim fields around indefinitely.

## Decision 4: Preserve registration and telemetry behavior on firmware
- Decision: Firmware continues to register the node and report telemetry, but no longer tracks claim status.
- Rationale: The node still needs to come online and sync normally; only claim-related logic is being removed.
- Alternatives considered: Rework provisioning or telemetry flow as part of this feature, or leave claim-related firmware state untouched.

## Decision 5: Keep power profile, capability, and naming flows intact
- Decision: Non-claim node management remains available because the feature only removes the claim boundary.
- Rationale: The user request targets the claim ceremony, not the rest of node administration.
- Alternatives considered: Remove all node configuration controls, or keep them gated behind claim state.
