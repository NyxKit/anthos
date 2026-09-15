# Feature Specification: Node Firmware Reliability Hardening

**Feature Branch**: `019-node-firmware-hardening` (created from `main` at `7809acc71d1c4b87c4add30757ae538e2e595d2e`)\
**Created**: 2026-09-15\
**Status**: Implementation started — independent first increment; safety and deployment decisions remain open\
**Input**: User description: "create a proper spec file based off of the latest audit"\
**Source**: [Node firmware reliability and maintainability audit, 2026-09-15](../../docs/audits/20260915-node-firmware.md), inspected revision `7809acc71d1c4b87c4add30757ae538e2e595d2e`.

## Problem and Scope

Nodes can exceed requested watering durations, repeat an action after a reboot, sleep with unfinished work, lose acknowledged power settings, and publish stale measurements as fresh. Provisioning and recovery also break across firmware, native BLE, and hub contracts. These failures prevent operators from relying on unattended operation even when individual happy-path tests pass.

This feature incrementally hardens the existing firmware and the server, shared contracts, and provisioning client needed to make its lifecycle reliable. It covers all 17 confirmed defects (D01–D17), verification or mitigation of all eight risks (R01–R08), and the audit's testability and reproducibility work. Risk findings remain hypotheses where the audit requires physical verification; this spec does not claim they have been reproduced.

### In Scope

- Bounded physical actions, durable command outcomes, expiry, safe capability changes, and sleep coordination.
- Persistent applied cadence, current and valid measurements, sensor recovery, and accurate diagnostics.
- Recoverable provisioning, hub discovery/address repair, complete configuration, and device authentication.
- Validated contracts, bounded network work, controlled retries, reproducible builds, and executable failure-path tests.
- Hardware qualification for the declared board, wiring, sensors, and native provisioning platforms.

### Out of Scope

- A firmware rewrite, replacement of the runtime or build platform, or broad UI redesign.
- New watering hardware, flow feedback, reservoir sensing, or automatic soil calibration.
- Exactly-once physical water delivery or replaying historical telemetry from a durable sample backlog.
- General authentication redesign beyond device enrollment, recovery, and node operations.
- Optional architecture cleanup unrelated to the requirements below; audit Stage 4 work is permitted only where it directly supports them.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Water within an enforced limit (Priority: P1)

As an operator, I want watering to stop within a validated limit even when networking stalls, so a software delay cannot cause uncontrolled watering.

**Why this priority**: This directly controls a physical action and its potential damage.

**Independent Test**: Run short watering commands against delayed or unavailable hub services, then observe the output through boot, reset, capability changes, and sleep using a dummy load and logic analyzer.

**Acceptance Scenarios**:

1. **Given** a valid duration `d` within the approved safety ceiling, **When** network or logging work stalls during watering, **Then** the output turns off by `d + approved cutoff tolerance`, independently of network progress.
2. **Given** an invalid, non-integral, overflowing, or over-limit duration, **When** it reaches either command validation or the actuator, **Then** it is rejected without activation.
3. **Given** a watering module connected at boot, **When** the node powers up, resets, enters provisioning, factory-resets, or sleeps, **Then** the verified hardware configuration keeps the actuator off except during an authorized action.
4. **Given** watering is active, **When** capability changes to Earth, **Then** the actuator is stopped before pin reconfiguration and the action is reported as interrupted rather than completed.
5. **Given** an Earth node receives a Watering capability and a pump command together, **When** processing that response, **Then** the command cannot start until the hardware has successfully applied Watering capability.

### User Story 2 - Recover command outcomes without repeating watering (Priority: P1)

As an operator, I want interrupted or unconfirmed actions to remain visible and recoverable so reconnecting a node does not silently repeat watering or permanently block its queue.

**Why this priority**: Physical execution and hub acknowledgement can fail independently.

**Independent Test**: Interrupt execution at each durable state transition, reconstruct the node, redeliver the same command, and inject lost responses and permanent acknowledgement failures.

**Acceptance Scenarios**:

1. **Given** an action was durably marked started, **When** the node reboots before its outcome is confirmed, **Then** it does not automatically activate that command again and exposes an interrupted or uncertain outcome under the proposed recovery policy.
2. **Given** watering completed and the acknowledgement response was lost, **When** the command is redelivered, **Then** only its recorded outcome is reconciled; the pump does not run again.
3. **Given** a physical command has expired, **When** a node returns from an outage or receives delayed delivery, **Then** it does not activate the pump and the expiry is visible to the operator.
4. **Given** acknowledgement encounters transport failure, server failure, authentication failure, or an unknown command, **When** recovery runs, **Then** failures are classified, retries are bounded, and permanent rejection enters explicit reconciliation without discarding execution history.
5. **Given** an old outcome needs reconciliation, **When** its safe recovery policy permits subsequent work, **Then** later commands can proceed without replaying the old action or requiring a reboot to clear an active flag.

### User Story 3 - Preserve power behavior through complete wake cycles (Priority: P1)

As an operator, I want acknowledged power settings to survive reset and each wake cycle to finish safely before sleep.

**Why this priority**: Current sleep behavior can interrupt watering and silently undo the selected power profile.

**Independent Test**: Apply every profile, reboot, run repeated wake cycles, and deliver commands at the final pre-sleep poll, including across clock rollover.

**Acceptance Scenarios**:

1. **Given** a profile is acknowledged as applied, **When** the node resets or wakes from deep sleep, **Then** sensing, publishing, polling, and sleep decisions use the same validated interval.
2. **Given** the grace window expires, **When** a final poll starts watering or changes the profile to Performance, **Then** the node re-evaluates current work and policy and does not enter the previously planned sleep.
3. **Given** an action outcome cannot reach an unavailable hub, **When** the approved awake retry budget expires, **Then** sleep is allowed only after the output is off and the outcome and recovery work are durably retained.
4. **Given** a successful cycle starts its 10-second grace window near clock rollover, **When** the clock wraps, **Then** the full grace window still elapses before sleep becomes eligible.
5. **Given** the final poll fails or publication returns an invalid success response, **When** sleep is considered, **Then** the node follows explicit bounded failure recovery and does not classify the cycle as successfully completed.

### User Story 4 - Trust readings and recover individual sensors (Priority: P1)

As an operator, I want current, valid measurements and visible sensor faults so displays and automation do not act on fabricated or stale data.

**Why this priority**: A plausible but incorrect moisture reading can influence watering decisions.

**Independent Test**: Exercise first boot, slow measurement readiness, partial ENV failures, detach/reattach, invalid numerical values, and long sleep cycles through the firmware-to-automation contract.

**Acceptance Scenarios**:

1. **Given** no valid sample has been acquired, **When** telemetry is published, **Then** no default zero is represented as a measurement; node health may still be reported.
2. **Given** a metric stops updating while another remains healthy, **When** its freshness limit is exceeded, **Then** it is omitted from current measurements or explicitly marked stale with its age, and automation excludes it.
3. **Given** an ENV unit is absent or fails initialization, **When** it later becomes available, **Then** it can initialize and resume valid measurements without rebooting or disabling an independent working unit.
4. **Given** a driver returns a nonfinite, missing, or invalid value, **When** telemetry is encoded and consumed, **Then** that value never becomes an ordinary zero.
5. **Given** a configured analog Earth input, **When** probe presence cannot be established electrically, **Then** the system does not claim positive detection or label every full-scale reading as disconnected.
6. **Given** a supported pressure sensor and a known reference input, **When** its processing and telemetry paths run, **Then** pressure units remain correct throughout, including any intermediate compensation input.

### User Story 5 - Provision and repair a node reliably (Priority: P2)

As an operator, I want onboarding failures to explain what failed and allow a retry without leaving the node trapped in partial configuration.

**Why this priority**: Reliable recovery is necessary to install and maintain nodes without manual firmware intervention.

**Independent Test**: Run the declared native BLE adapter through scan, connect, subscribe, write, terminal status, and disconnect; inject credential, storage, Wi-Fi, discovery, and client-disconnect failures.

**Acceptance Scenarios**:

1. **Given** a supported native client, **When** onboarding runs, **Then** actual plugin commands and event channels carry the existing GATT payloads through the complete session.
2. **Given** malformed or oversized credentials, **When** submitted, **Then** the node returns a structured failure without replacing valid configuration or logging secrets.
3. **Given** a failed join or a power cut during configuration storage, **When** the node restarts, **Then** it uses the prior complete validated configuration or offers provisioning again, never a partial record.
4. **Given** a long Wi-Fi join, duplicate write, cancellation, or disconnect, **When** events arrive, **Then** BLE callbacks remain responsive, only one attempt owns the configuration change, and reset/cancel remains serviceable.
5. **Given** a terminal Wi-Fi result, **When** the session closes, **Then** the connection and provisioning server cease accepting writes and do not restart advertising until an explicit provisioning retry begins.
6. **Given** an omitted or obsolete hub address, **When** the node attempts registration, **Then** it discovers a valid advertised host and port under the proposed discovery policy or presents an actionable repair path with bounded retries.
7. **Given** Wi-Fi succeeds but enrollment fails or the pairing window closes, **When** the client reports progress, **Then** Wi-Fi connection and hub registration remain distinct outcomes and enrollment failure can be retried without erasing working Wi-Fi credentials.

### User Story 6 - Reject invalid device traffic and recover from outages (Priority: P2)

As an operator, I want only the enrolled node to retrieve or acknowledge its commands, and I want malformed responses or hub outages to leave its known-good state intact.

**Why this priority**: Identity and contract failures can falsify physical completion or change hardware behavior.

**Independent Test**: Exercise real server routes and firmware decoders with missing/wrong-node credentials, incomplete responses, mismatched identities, oversized bodies, and simultaneous reconnects.

**Acceptance Scenarios**:

1. **Given** missing or wrong-node device credentials, **When** polling or acknowledging commands, **Then** the request is rejected without disclosing commands or changing outcomes.
2. **Given** only a known hardware ID, **When** an unauthenticated caller registers it, **Then** no existing device secret is returned; an authenticated enrolled node can still reconnect with stable identity while pairing is closed.
3. **Given** an empty, malformed, oversized, or identity-mismatched success response, **When** it is decoded, **Then** configuration remains unchanged and no false publication, completion, or dependent physical action occurs.
4. **Given** multiple nodes reconnect to a slow or unavailable hub, **When** retries run, **Then** request rate and work per cycle stay within declared budgets, actuator deadlines remain intact, and nodes recover automatically after service returns.

### User Story 7 - Diagnose and reproduce field failures (Priority: P3)

As a maintainer, I want accurate event dates, identifiable builds, and repeatable failure tests so field behavior can be explained and fixes verified.

**Why this priority**: Long-term reliability depends on evidence beyond compilation and isolated happy-path tests.

**Independent Test**: Reconstruct a provisioning, sensor, or acknowledgement failure from collected diagnostics, rebuild its declared dependency set, and execute the corresponding production transition test without a device.

**Acceptance Scenarios**:

1. **Given** a node without synchronized epoch time, **When** it sends logs before or after reboot or clock rollover, **Then** the hub archives them on the receipt date and retains uptime separately.
2. **Given** a deployed build, **When** diagnostics are collected, **Then** its source/dependency identity, reset reason, applied cadence, sensor freshness, delivery failures, and unresolved command state can be determined without exposing secrets.
3. **Given** a clean checkout and declared dependency set, **When** automated validation runs, **Then** it builds the firmware and executes production failure transitions and shared contract fixtures, reporting executed tests separately from compilation.

### Edge Cases

- Power or storage failure before activation, immediately after activation, after shutoff, and after server acknowledgement commit but before response delivery.
- A queue larger than the per-cycle work budget, expired actions delivered late, duplicate IDs, and a changed logical node ID during acknowledgement recovery.
- Missing, corrupt, or legacy saved cadence/configuration; a failed persistence operation must prevent a successful applied acknowledgement.
- Unknown capability, a repeated unchanged capability, and a capability prohibited by the build's port mode.
- A final poll that changes cadence more than once, fails, or starts an action as the grace window ends.
- Maximum-length multibyte credentials, embedded NULs, duplicate provisioning writes, delayed callbacks after teardown, and a disconnected client that cannot receive terminal status.
- Missing, trailing-slash, invalid, unreachable, or ambiguous discovered hub URLs; a hub restart closes pairing while Wi-Fi onboarding is in progress.
- One fresh ENV metric beside a stale one, sensors still warming when the cycle budget expires, both ENV Pro addresses, and a recoverable bus fault while analog sensing remains usable.
- NaN, infinities, missing values, legitimate zero readings, and legitimate dry-probe full-scale readings.
- Unsynchronized time, timer wrap including a deadline wrapping to zero, hub replacement, token loss, and mixed firmware/server versions.

## Requirements *(mandatory)*

### Functional Requirements

#### Physical actions and command lifecycle

- **FR-001**: The node MUST enforce actuator shutoff independently of network, logging, sensor, and queue progress, within the approved duration ceiling and cutoff tolerance (OD-001).
- **FR-002**: The hub and node MUST reject nonfinite, nonpositive, non-integral, out-of-range, or overflowing actuator durations before activation; requested volume conversion MUST respect the same ceiling. Invalid commands MUST fail explicitly rather than be silently clamped.
- **FR-003**: The supported board configuration MUST establish actuator off before optional peripheral initialization, avoid peripheral ownership conflicts on actuator pins, and demonstrate safe off through power-on, reset, provisioning, factory reset, and sleep/wake.
- **FR-004**: Physical commands MUST retain durable execution identity and lifecycle transitions before activation and after shutoff. Failure to persist required execution state MUST prevent activation. Recovery MUST preserve completed or uncertain execution knowledge without automatically repeating the action, subject to OD-002 confirmation.
- **FR-005**: Physical commands MUST have an explicit validity window enforced by both hub delivery and node execution. A node unable to establish validity MUST not activate the command. The validity duration and time/lease semantics remain OD-002.
- **FR-006**: Acknowledgement handling MUST preserve the identity under which execution began, validate returned command identity and terminal outcome, distinguish transient from permanent failure, and reconcile durable outcomes without an endless active-command block or action replay.
- **FR-007**: Capability changes MUST be validated and applied at one coordinated lifecycle boundary before dependent commands execute. Leaving Watering MUST stop the actuator and record interruption before reconfiguring hardware. Repeated identical capability updates MUST not interrupt valid work.

#### Power and cycle coordination

- **FR-008**: The node MUST durably save and restore its validated applied interval before acknowledging a profile as completed. Missing, corrupt, or legacy values MUST follow a documented migration/default policy and MUST not be represented as a previously applied profile.
- **FR-009**: Regular sensing, publication, command polling, and sleep policy MUST retain one applied interval: Performance 1,000 ms, Balanced 600,000 ms, and Power Saver 3,600,000 ms. Safety deadlines and failure retries MUST remain serviceable independently of that cadence.
- **FR-010**: Sleep eligibility MUST be re-evaluated after the final command poll using current applied policy, actuator state, and outstanding work. The node MUST NOT sleep with an active actuator or unpersisted required outcome.
- **FR-011**: Unavailable services MUST have a bounded awake recovery budget. After exhaustion, sleep MAY defer acknowledgement only with the actuator off and durable reconciliation state; poll/publication failures MUST remain recorded as failures (OD-004).
- **FR-012**: The node MUST preserve the 10-second grace window and existing suspend cutoff policy with rollover-safe elapsed-time checks. Performance MUST remain continuously awake.
- **FR-013**: The node MUST report actual applied cadence so the hub can distinguish assignment, pending application, and device-confirmed state. Status integration MUST retain the existing three-missed-interval online policy without silently substituting a requested profile for observed application.

#### Measurements and sensor lifecycle

- **FR-014**: Each published metric MUST have a successful acquisition and independently tracked validity and acquisition time/age. Each wake cycle MUST attempt a bounded current measurement before publication; readiness timeout MUST yield explicit unavailability or omission, never fabricated defaults.
- **FR-015**: Stale, invalid, missing, and nonfinite measurements MUST NOT become valid zeros or fresh observations in storage, display, or automation. Legitimate zeros MUST remain valid. Acquisition freshness MUST remain distinct from hub receipt time (OD-004).
- **FR-016**: Each supported ENV unit MUST independently track discovery, initialization, measurement readiness, failure, and recovery. Failed initialization/read or later attachment MUST be retryable without a full reboot, and one failed unit MUST not prevent unrelated working units from operating.
- **FR-017**: Metric units and valid ranges MUST be defined and checked at producer/consumer boundaries. ENV Pro pressure MUST be verified at its processing input as well as its output; output relabeling or unexplained scaling MUST not conceal an incorrect internal unit conversion.
- **FR-018**: Earth input configuration MUST be distinguished from detected physical presence. Disconnect diagnostics MUST only be claimed for validated circuitry; full-scale readings alone MUST not imply absence.
- **FR-019**: Sensor standby and bus-fault recovery MUST match supported hardware, use bounded attempts, and expose unresolved faults. Physical sensor power-off MUST only be claimed when the supply is actually switched and measured; safe actuator service MUST survive a bus fault.

#### Provisioning and configuration recovery

- **FR-020**: The native provisioning adapter MUST match its declared BLE plugin's real command, argument, and event contracts, while retaining existing GATT UUIDs and compatible credential/status payloads.
- **FR-021**: Provisioning MUST validate field types, byte lengths, embedded NULs, and hub URL before mutation, return structured validation/storage/join failures, and exclude passwords and device tokens from logs.
- **FR-022**: Only complete, successfully validated and persisted configuration MUST become authoritative. Failed or interrupted changes MUST retain prior valid configuration or re-enter recoverable onboarding; legacy records MUST be validated during migration.
- **FR-023**: Provisioning callbacks MUST return without performing the full join workflow. Cross-task events MUST be synchronized, duplicate writes controlled, reset/cancel serviceable, and each attempt MUST reach a bounded terminal state.
- **FR-024**: After reporting a terminal Wi-Fi result, provisioning MUST reject further writes, close the connection and server safely, and prevent implicit advertising restart. Failure retries MUST start an explicit new session without invalid callback ownership or stale events.
- **FR-025**: Hub URLs MUST be validated and normalized consistently. Missing or obsolete addresses MUST support bounded discovery and explicit address repair without erasing working Wi-Fi configuration; proposed DNS-SD selection behavior is subject to OD-003.
- **FR-026**: The client MUST distinguish Wi-Fi success from completed hub enrollment, expose registration/pairing failure, and support retry after pairing expiry or hub restart. Hub registration MUST proceed over Wi-Fi after BLE closes.

#### Trust, contracts, and resource bounds

- **FR-027**: Command polling and acknowledgement MUST authenticate the enrolled device and bind access to the addressed node. Existing ingest/log token checks MUST remain effective, and repeated valid terminal acknowledgements MUST remain idempotent.
- **FR-028**: Known hardware identity alone MUST NOT disclose an existing device secret. Authenticated re-registration MUST preserve stable identity without reopening pairing; token-loss/reset recovery MUST use an explicit authorized enrollment path (OD-003).
- **FR-029**: Registration, ingest, queue, and acknowledgement responses MUST validate required fields, types, allowed enums, and relevant identities before changing configuration or recording success. Invalid responses MUST retain prior known-good state; partial responses MUST not mix old secrets with new identity.
- **FR-030**: Shared contracts MUST describe actual device token, metric, capability, command outcome, cadence, and success-response shapes. Shared named string values MUST use canonical string enums. Mixed-version compatibility and coordinated rollout MUST be documented before contract changes ship.
- **FR-031**: Network response bytes, command count, per-cycle work, and serialization memory MUST have explicit finite budgets. Oversized, truncated, allocation-failed, or malformed data MUST fail without partial configuration or unintended activation. Hot sensor-read and telemetry-push loops MUST avoid dynamic allocation in accordance with repository guidance.
- **FR-032**: Transient failures MUST use capped backoff with jitter and honor applicable retry guidance. Healthy nodes MUST register on explicit lifecycle/configuration needs rather than unconditionally every five seconds; recovery and eventual configuration refresh MUST remain automatic.

#### Diagnostics and verification

- **FR-033**: Unsynchronized firmware logs MUST use hub receipt epoch for archival and carry uptime separately; reboot and rollover MUST not route new events to 1970 archives.
- **FR-034**: Diagnostics MUST expose build identity, reset cause, applied cadence, sensor validity/freshness, last successful delivery, delivery/parse/drop failures, unresolved action state, and resource/timing measurements sufficient to investigate the audited failures without exposing secrets.
- **FR-035**: Firmware builds MUST resolve a pinned dependency set and report traceable source/build identity. Automated checks MUST compile production firmware and execute production lifecycle logic with controllable clock, storage, transport, sensor, output, and sleep boundaries, plus shared producer/consumer contract fixtures.
- **FR-036**: Qualification MUST record the exact board/module/wiring and native platform matrix, execute controlled physical checks and a fault soak, and distinguish measured results from simulations, compilation-only checks, and unresolved risks. Documentation touched by this work MUST match verified behavior.

### Key Entities *(include if feature involves data)*

- **Hardware Node**: Immutable hardware identity bound to hub-assigned logical identity, enrollment credentials, and build identity; remains separate from plants and sensors.
- **Validated Configuration**: Complete saved connection and applied operating settings, with explicit validity/version and pending-change state.
- **Applied Runtime State**: Successfully configured capability and cadence, distinct from a hub request and from persisted-but-not-applied values.
- **Physical Command Record**: Command ID, original execution identity, bounded duration, validity window, durable execution/outcome state, and acknowledgement/reconciliation state.
- **Measurement Snapshot**: Per-metric value, unit, acquisition time/age, validity, and sensor source; hub receipt time remains a separate observation.
- **Provisioning Attempt**: One validated input, connection progress, terminal Wi-Fi result, configuration commit outcome, and session lifecycle; enrollment is a subsequent phase.
- **Diagnostic Snapshot**: Build/reset identity, connectivity and delivery progress, applied policy, sensor faults, command recovery state, and bounded-resource counters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Across blocked-network, delayed-log, capability-change, and lifecycle fault cases, every valid action turns off within the approved tolerance and every invalid/expired action produces zero activations. Physical waveform evidence confirms the bound for the qualified hardware (OD-001).
- **SC-002**: Across power cuts at every command persistence/activation/acknowledgement boundary, redelivery causes zero automatic repeat activations for started or completed IDs; every uncertain outcome remains recoverable and visible (OD-002).
- **SC-003**: All three profiles survive runtime reconstruction; each long profile completes at least three consecutive real sleep/wake cycles with the same applied interval. Final-poll and rollover scenarios produce zero sleeps with active actuators, lost outcomes, or stale profile decisions.
- **SC-004**: Every first-sample, stale-cache, partial-sensor, and invalid-number fixture produces zero fabricated valid values and zero automation evaluations using invalid/stale measurements. Supported sensors recover within the declared recovery budget after a recoverable fault clears (OD-004).
- **SC-005**: Every supported native platform completes a real onboarding round trip. Every injected configuration write failure or power-cut boundary recovers to complete prior configuration or onboarding; terminal sessions accept zero further credential writes (OD-003).
- **SC-006**: All missing-token, wrong-node, known-ID-only secret retrieval, malformed-response, and identity-mismatch cases are rejected without unintended state changes; authenticated stable re-registration and idempotent acknowledgements pass.
- **SC-007**: At the declared fleet size and payload/work limits, outage and reconnect tests remain within retry/resource budgets, produce zero missed actuator cutoffs, and recover automatically within the declared recovery target (OD-004).
- **SC-008**: Firmware-shaped logs at boot, reboot, and rollover archive on the correct receipt date in every fixture. A maintainer can identify build, applied cadence, sensor failure, and pending command outcome from each scripted diagnostic trace.
- **SC-009**: A clean build resolves the declared dependency set; automated validation executes the audit's host failure-scenario matrix. A minimum 24-hour hardware fault soak records zero unintended activations, unexpected resets, or unreconciled loss of durable command state, with resource and latency measurements retained. This is an initial qualification gate, not a lifetime reliability claim.

## Audit Traceability

The source audit contains the evidence and confidence for each ID. A risk is closed by a verified mitigation or documented evidence that it does not affect the qualified configuration, not by silently reclassifying it as a confirmed defect.

| Finding | Required disposition | Requirements | Acceptance evidence |
|---|---|---|---|
| D01 — Network extends pump activation | Independent bounded shutoff | FR-001 | Story 1; SC-001 |
| D02 — Sleep loses work or uses old profile | Recheck work/current policy; durable deferral | FR-010–FR-011 | Story 3; SC-003 |
| D03 — Replay after reset; commands never expire | Durable lifecycle, expiry, reconciliation | FR-004–FR-006 | Story 2; SC-002 |
| D04 — No action ceiling | Validated local and hub bounds | FR-001–FR-002 | Story 1; SC-001 |
| D05 — Applied interval lost on reboot | Durable applied cadence and reporting | FR-008–FR-009, FR-013 | Story 3; SC-003 |
| D06 — Native BLE contract mismatch | Real plugin adapter and platform round trip | FR-020 | Story 5; SC-005 |
| D07 — No hub discovery/address recovery | Normalize, discover, repair; distinct enrollment status | FR-025–FR-026 | Story 5; SC-005 |
| D08 — Partial/failed credentials authoritative | Validate and commit complete configuration | FR-021–FR-022 | Story 5; SC-005 |
| D09 — BLE server remains writable | Complete explicit session teardown | FR-024 | Story 5; SC-005 |
| D10 — ENV lifecycle cannot recover | Independent repeatable unit recovery | FR-016 | Story 4; SC-004 |
| D11 — Default/stale values appear fresh | Current acquisition and per-metric freshness | FR-014–FR-015 | Story 4; SC-004 |
| D12 — Invalid numbers/probe assumptions | Value validity and honest presence semantics | FR-015, FR-017–FR-018 | Story 4; SC-004 |
| D13 — Rejected ACK blocks queue forever | Classified retry and durable reconciliation | FR-006, FR-032 | Story 2; SC-002 |
| D14 — Identity is not authentication | Node-bound operations and secure enrollment recovery | FR-027–FR-028 | Story 6; SC-006 |
| D15 — Direct logs archived in 1970 | Receipt epoch separate from uptime | FR-033 | Story 7; SC-008 |
| D16 — Unsafe capability application | Coordinated safe hardware transition | FR-007 | Story 1; SC-001 |
| D17 — Sleep hold fails at rollover | Elapsed-time grace window | FR-012 | Story 3; SC-003 |
| R01 — Startup pin ownership conflict | Establish safe configuration; measure reset/boot waveform | FR-003, FR-036 | Story 1; SC-001 |
| R02 — Blocking callbacks and shared state | Responsive synchronized provisioning lifecycle | FR-023–FR-024 | Story 5; SC-005 |
| R03 — Unbounded response/work/allocation | Finite decoding, work, and memory budgets | FR-031, FR-034 | Story 6; SC-007 |
| R04 — Incomplete contracts mutate hardware | Atomic validation and shared contract coverage | FR-007, FR-029–FR-030 | Story 6; SC-006 |
| R05 — ENV Pro pressure conversion | Verify processing input/output units and dependency | FR-017, FR-035–FR-036 | Story 4; SC-004 |
| R06 — Retry and re-registration pressure | Bounded backoff and lifecycle registration | FR-032 | Story 6; SC-007 |
| R07 — Standby and bus recovery unverified | Supported recovery and measured power behavior | FR-019, FR-036 | Story 4; SC-004, SC-009 |
| R08 — Reproducibility and diagnosis gaps | Applied-state ownership, diagnostics, builds, tests | FR-007–FR-008, FR-034–FR-036 | Story 7; SC-008–SC-009 |

## Delivery and Verification Gates

1. **Immediate correctness and safety**: Deliver Stories 1–4's action, sleep, cadence, and measurement correctness plus accurate log time. Build the production transition test seams alongside fixes. Watering qualification requires OD-001/OD-002 resolution and physical cutoff evidence.
2. **Reliability and contract integration**: Complete provisioning, sensor recovery, authenticated device operations, bounded transport, cadence reporting, and response validation. Document and test migration and mixed-version behavior before rollout.
3. **Reproducibility and qualification**: Complete automated firmware/contract checks, dependency/build identity, diagnostic traces, native platform checks, hardware fault tests, and the soak. Retain results against the audit matrix; compilation alone cannot close a physical or lifecycle finding.

These are delivery groupings, not an implementation task list. Detailed architecture, exact wire changes, test commands, and work estimates belong in the subsequent plan.

## Open Decisions

The following answers are not established by the audit. Proposed defaults below are draft policies, not approved hardware safety values. Unrelated specification and planning work can proceed; dependent implementation and qualification require resolution.

- **OD-001 — Physical safety envelope**: [NEEDS CLARIFICATION: Which exact watering module/revision, supply, enable circuit, and pin wiring are deployed; what are the maximum single duration/dose and allowable shutoff tolerance; are cooldown or aggregate-dose limits required?] Do not invent numeric limits from the existing assumed volume conversion. Until a supported envelope is defined, unattended watering cannot pass acceptance.
- **OD-002 — Interrupted actions and expiry**: [NEEDS CLARIFICATION: Confirm the proposed no-automatic-replay policy for started/uncertain actions, the operator reconciliation path, and the maximum command age or lease window.] Proposed default: durably record before activation, report uncertain interruption, and require a new authorized command for another physical attempt. This favors avoiding duplicate watering and can under-water.
- **OD-003 — Supported onboarding and enrollment recovery**: [NEEDS CLARIFICATION: Which native platforms must be qualified, how should multiple discovered hubs be selected, and what authorized recovery flow should replace a lost device token?] Proposed default: preserve optional URL via actual DNS-SD host/port discovery, require explicit selection when ambiguous, keep Wi-Fi success separate from enrollment, and allow token replacement only through an authorized re-enrollment flow that preserves stable hardware identity.
- **OD-004 — Operating budgets and hardware matrix**: [NEEDS CLARIFICATION: Define supported sensor combinations, freshness/readiness/recovery limits, awake failure budget, payload/queue/retry limits, target fleet size and outage duration, and whole-node sleep-current target for the deployed power configuration.] The 24-hour initial soak and three real cycles per long profile are proposed minimum verification coverage, not evidence that a battery or fleet target has already been met.

## Assumptions

- The audit is the requirements baseline; its hardware-unverified findings require evidence and its inspected revision may differ from the eventual implementation starting point.
- Existing static subsystem ownership and driver/client boundaries can support incremental hardening; no wholesale rewrite is assumed necessary.
- Hardware identity, hub-assigned `node-001` style identity, generic firmware, and the separation of plant, node, and sensor remain invariant.
- Pairing gates new enrollment; authenticated existing-device reconnection bypasses it. Authorized secret recovery is a distinct flow.
- Latest-only telemetry remains acceptable; health delivery does not imply a fresh sensor sample, and receipt time does not establish acquisition freshness.
- Existing single-cadence and grace-window behavior is retained. This spec makes pending, persisted, and applied state explicit where earlier features treated them as equivalent.
- No physical probe presence, switched sensor rail, exact watering volume, or safe reset electrical behavior is assumed without verification.

## Dependencies

- [Generic Node Provisioning](../002-generic-node-provisioning/spec.md) and its [BLE contract](../002-generic-node-provisioning/contracts/ble-gatt.md): identity, enrollment, and session invariants.
- [Pump Command Queue](../008-pump-command-queue/spec.md): existing queue and terminal acknowledgement behavior; this spec adds durability, expiry, authentication, and reconciliation.
- [Power Profiles](../011-power-profiles/spec.md), [Node Power Suspend](../017-node-power-suspend/spec.md), and [Power Telemetry Online Status](../018-power-telemetry-online/spec.md): preserved presets, one cadence, sleep grace/cutoff, and expected-silence status behavior.
- Coordinated firmware, server, shared-type, and native-client contract changes with documented compatibility and migration for saved configuration, device tokens, and pending commands.
- Access during qualification to the actual supported AtomS3 Lite/module/sensor configurations, native provisioning platforms, a dummy load, timing instrumentation, reference measurements, and controllable network/power/bus faults.
- Resolution of OD-001–OD-004 before claiming acceptance of dependent safety, recovery, performance, or hardware requirements.
