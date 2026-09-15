# Tasks: Node Firmware Reliability Hardening

**Scope**: all requirements in [spec.md](spec.md), staged by [plan.md](plan.md). Checked items describe only the completed first increment; no complete user story or hardware finding is marked accepted.

## First increment

- [x] T001 Create the spec branch from `main`, retaining the source spec and audit.
- [x] T002 Persist and restore validated single cadence in `node/src/NvsConfig.*`; acknowledge profile completion only after persistence in `CommandClient.cpp` (FR-008/FR-009).
- [x] T003 Introduce production `SleepCoordinator.*`, use rollover-safe elapsed timing and recheck current interval/work after the final poll in `NodeApp.cpp` (FR-010/FR-012; partial FR-011).
- [x] T004 Propagate final-poll failures and validate ingest/queue envelopes in `CommandClient.cpp`, `ApiClient.cpp` and `DeviceResponseValidator.*` (partial FR-029).
- [x] T005 Separate receipt epoch from firmware uptime in `ApiClient.cpp`, `LogsController.ts` and shared log contracts, including legacy firmware compatibility (FR-033).
- [x] T006 Execute production cadence, sleep and decoder logic using `node/tests/host` and `node/scripts/test_host.py`; cover storage failures, restoration, pending work, final-poll changes, failure and rollover.
- [x] T007 Test direct log archival through the real archive service, including boot/reboot/rollover and malformed uptime; run API tests/build and firmware build; record results.

## Action safety and recovery

- [ ] T008 Resolve OD-001/OD-002 and record module/wiring, cutoff/duration envelope, interruption policy, reconciliation UX and expiry semantics.
- [ ] T009 Implement independent bounded shutoff, boot/reset/provisioning/sleep output-off behavior and hub/node duration validation in `PumpActuator.*`, `NodeApp.cpp` and queue validation (FR-001–FR-003).
- [ ] T010 Define shared command lifecycle/expiry/acknowledgement contracts and storage migrations; persist execution identity and started/outcome transitions in firmware and reconcile idempotently in queue services/controllers (FR-004–FR-006, FR-030).
- [ ] T011 Coordinate validated capability changes before execution; stop and persist interruption before pin changes (FR-007).
- [ ] T012 Integrate durable pending outcomes with bounded awake recovery, final poll/publication failures and sleep (remaining FR-010/FR-011). Depends on T010 and OD-004.

## Cadence reporting and measurements

- [ ] T013 Report device-confirmed applied cadence and distinguish missing/corrupt fallback from applied/pending assignment across telemetry, registry and shared online policy (FR-013; remaining FR-008).
- [ ] T014 Resolve OD-004 sensor combinations and freshness/readiness/recovery budgets.
- [ ] T015 Acquire bounded current samples before wake publication; retain independent metric validity/acquisition age through storage, display and automation (FR-014/FR-015).
- [ ] T016 Implement independent ENV lifecycle/recovery; verify pressure conversion at processing input and output, valid ranges, Earth presence semantics and bounded bus/standby recovery (FR-016–FR-019).

## Provisioning and trust

- [ ] T017 Resolve OD-003 supported native platforms, hub selection and authorized lost-token recovery.
- [ ] T018 Validate and atomically persist complete configuration, including legacy migration and injected power-cut/storage failures (FR-021/FR-022).
- [ ] T019 Implement synchronized nonblocking BLE attempts, duplicate/cancel handling and explicit terminal teardown; align native adapter with installed plugin and test real round trips (FR-020/FR-023/FR-024).
- [ ] T020 Implement URL normalization, bounded discovery/address repair and distinct Wi-Fi/enrollment progress and retry (FR-025/FR-026).
- [ ] T021 Authenticate node-bound command polling/ACK and stable re-registration; remove known-ID secret disclosure and implement authorized recovery (FR-027/FR-028).
- [ ] T022 Finish response/command validation and shared producer/consumer fixtures, documenting coordinated rollout and mixed-version behavior (FR-029/FR-030).

## Budgets, diagnostics and qualification

- [ ] T023 Resolve remaining OD-004 resource/fleet/outage/sleep-current budgets; enforce finite transport/queue/serialization work and allocation failure behavior (FR-031).
- [ ] T024 Implement classified capped backoff with jitter and lifecycle-driven registration/configuration refresh (FR-032).
- [ ] T025 Report build/reset/cadence/metric/delivery/command/resource diagnostics; pin dependencies and add production build and expanded host lifecycle checks to CI (FR-034/FR-035).
- [ ] T026 Record exact hardware/platform matrix, physical cutoff waveforms and power/unit/bus measurements; run three real cycles per long profile, native round trips and 24-hour fault soak (FR-036, SC-001–SC-009).
- [ ] T027 Close audit findings only against retained evidence; update touched documentation and mark remaining simulations, unresolved risks and deployment restrictions accurately.
