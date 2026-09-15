# Implementation Plan: Node Firmware Reliability Hardening

**Branch**: `019-node-firmware-hardening`\
**Started**: 2026-09-15\
**Baseline**: `main`, `7809acc71d1c4b87c4add30757ae538e2e595d2e`\
**Requirements**: [spec.md](spec.md), [source audit](../../docs/audits/20260915-node-firmware.md)

## Delivery approach

Harden existing subsystem boundaries incrementally. Exercise production C++ with replaceable hardware boundaries on the host, compile the actual ESP32 application, and use Vitest for hub contracts. Hardware acceptance remains a separate gate. The first increment implements independent parts of Stories 3, 6 and 7; it does not close the complete stories or the audit.

Preserve generic firmware, immutable hardware identity, hub-assigned node identity, the single cadence, and the `anthos` NVS namespace. Keep database access in server services, contracts in `shared`, and named shared string values in enums. Deployment and hardware qualification remain separate from this implementation increment.

## First increment: implemented

### Cadence storage — FR-008/FR-009, D05

`NvsConfig` stores `interval_ms` as one unsigned 32-bit NVS value. Only the three existing presets are accepted: 1,000, 600,000 and 3,600,000 ms. `NodeApp::begin` restores it before provisioning, registration, sampling, publication or queue work. The read, publish and poll getters use the same cached applied value.

A profile command checks the JSON integer type, validates the preset, and persists before changing the cache or acknowledging completion. Open/write failure leaves the running interval unchanged and produces a failed acknowledgement. Repeated application of the stored preset avoids another flash write. The installed Arduino Preferences implementation returns four bytes only after `nvs_set_u32` and `nvs_commit` succeed.

Missing, wrongly typed or unsupported saved values use the existing 1,000 ms default without creating a persisted applied record. Legacy firmware had no durable cadence to migrate; operators must reapply an intended long profile after upgrade if its command was previously acknowledged by legacy firmware. Device-confirmed cadence reporting and reconciliation with the hub remain follow-up work (FR-013).

### Sleep coordination — FR-010/FR-012 and part of FR-011, D02/D17

`SleepCoordinator` owns an explicit idle/holding state and a 32-bit start time. Unsigned elapsed subtraction preserves the full 10-second hold through wrap, including a start or wrapped endpoint of zero.

Before polling for sleep, reject active or unresolved physical work. A final poll must actually succeed; `CommandClient::pollNow` now propagates transport, HTTP, parse and envelope-validation failures. After it returns, read the interval and pending work again. A pump start prevents sleep, Performance clears sleep eligibility, and a change between long profiles uses the new interval. Pending pump acknowledgement continues to inhibit sleep.

Failed final polls wait another existing 10-second grace period before retry. This is conservative interim behavior, not the proposed bounded awake budget: sleeping with unconfirmed outcomes requires durable command state and OD-002/OD-004. Total awake time during a persistent failure remains unbounded.

### Publication validation — part of FR-029, R04

`DeviceResponseValidator` validates required identity, capability and success fields before callers mutate state or mark a cycle successful. Queue envelopes require the addressed node and a commands array. Ingest success requires `accepted` or `registered`, the current node identity, and a known capability. Empty, malformed, wrong-node and embedded-NUL string values fail validation. Identity repair belongs to enrollment, rather than an unvalidated ingest response.

This does not yet validate every queued command, registration or acknowledgement, impose transport budgets, or coordinate hardware capability application. Those requirements remain explicit tasks.

### Direct device logs — FR-033, D15

Firmware sends `uptimeMs` to `/api/logs`. The authenticated controller archives using epoch time captured on hub receipt and preserves uptime in metadata. It accepts legacy `timestampMs` as the old firmware uptime alias. `DeviceLogRequest`, `DeviceLogResponse` and `DeviceLogStatus` describe the shared contract.

The log archive service continues to support explicit timestamps for its other producers; only direct device log ingestion changes. New firmware with an old hub omits the old timestamp field, so the old hub already falls back to receipt time, though it will not preserve the new uptime field. Old firmware with the new hub receives the full fix. Existing 1970 archives are not rewritten.

## Remaining architecture and ordering

1. **Action safety and durable commands (Stories 1–2):** establish the approved hardware envelope; enforce independent cutoff; store execution identity and started/outcome transitions before physical effects; define expiry, interrupted outcomes and idempotent reconciliation across shared contracts, SQLite queue and firmware. Capability application must stop and record interruption before pin reconfiguration and precede dependent execution. Depends on OD-001/OD-002.
2. **Complete wake cycles and measurement correctness (Stories 3–4):** integrate durable sleep deferral, device-confirmed cadence, current bounded acquisition, per-metric validity/age, independent ENV discovery/readiness/recovery, range/unit checks, and honest analog presence semantics. Define producer/consumer fixtures that exclude stale/invalid metrics from automation. Budgets and sensor qualification depend on OD-004.
3. **Provisioning and device trust (Stories 5–6):** stage validated complete configuration; serialize responsive BLE attempts; explicit terminal teardown; use the installed native plugin contract; normalize/discover/repair hub endpoints; distinguish Wi-Fi success from enrollment; bind poll/ACK to enrolled identity and replace known-ID token disclosure with authorized recovery. Platform, discovery and lost-token decisions depend on OD-003.
4. **Bounded operation and verification (Stories 6–7):** finite transport/queue/allocation budgets, classified capped retries with jitter, lifecycle registration, full response validation, pinned builds, build/reset/resource diagnostics and CI. Native round trips, physical cutoff/power/sensor measurements, three real cycles per long profile and the 24-hour fault soak remain qualification requirements.

For each contract-changing increment, write exact wire fixtures and storage migration/rollback notes before rollout. Do not silently add command outcomes or token-recovery behavior while OD-002/OD-003 remain unresolved. Preserve the three-missed-interval status rule when device-confirmed cadence is introduced.

## Open decisions

OD-001 through OD-004 in the spec remain unanswered. No maximum duration, dose, cutoff tolerance, expiry, fleet limit, sensor freshness limit or battery target is inferred from the existing code. The user has been asked for these values; independent work can continue without representing draft defaults as approved requirements.

## Validation

See [quickstart.md](quickstart.md) for repeatable commands and [validation.md](validation.md) for actual evidence and limitations. Host tests replace Preferences and clock/poll/work inputs while executing production cadence, sleep and response-validation logic. They do not simulate the full application or qualify electrical behavior.
