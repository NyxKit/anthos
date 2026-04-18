# Node Setup and Provisioning

This document captures node setup decisions for `AtomS3 Lite` nodes, including sensor wiring, battery trade-offs, and scalable provisioning.

## Goals

- support both `ENV Pro` and `ENV-III` in one firmware
- keep `Earth Unit` usable without breaking the shared `I2C` stack
- avoid brittle per-node flashing with baked-in `node_id` and server IP
- make onboarding easy for your own nodes and nodes built for others

## Current Hardware Baseline

- controller: `M5Stack AtomS3 Lite`
- shared bus sensors: `Ambient Light (BH1750)` + `ENV-III` or `ENV Pro`
- moisture: `Earth Unit` (analog + digital)
- optional bus expansion: `M5Stack 1-3 Hub Unit` for `I2C` units only

## Sensor Compatibility Notes

### ENV Pro and ENV-III

- firmware should auto-detect available ENV hardware at boot
- `ENV-III` is expected on `SHT30 (0x44)` + `QMP6988 (0x70)`
- `ENV Pro (BME688)` may appear on `0x77` or `0x76`
- both can be supported in one image with runtime detection and fallback behavior

### Earth Unit and Shared I2C

- `Earth Unit` is not an `I2C` unit; it exposes `AO` (analog) and `DO` (digital)
- same Grove/HY2.0 cable form factor is fine, but it should not share the passive `I2C` hub with `ENV` + `DLight`
- if combined on one node, wire Earth separately to GPIO/power

## Earth Unit Wiring (AtomS3 Lite)

- Earth wire roles: `black=GND`, `red=5V`, `yellow=DO`, `white=AO`
- `AO` must use an ADC-capable pin on AtomS3 Lite: `G5`, `G6`, `G7`, or `G8`
- `G38` and `G39` are not ADC-capable; do not use them for `AO`
- valid example mapping: `white(AO) -> G5`, `yellow(DO) -> G39`, `black -> GND`, `red -> 5V`

## Watering Unit

- product: `M5Stack Watering Unit - Soil Moisture Sensor and Water Pump`
- source: `https://www.tinytronics.nl/en/platforms-and-systems/m5stack/unit/m5stack-watering-unit-soil-moisture-sensor-and-water-pump`
- on `AtomS3 Lite`, the watering unit uses `white(AO) -> G8` and `yellow -> G39`
- black still goes to `GND` and red still goes to `5V`
- the difference is behavioral, not wiring: `Earth` treats `G39` as a sensor digital input, while `Watering` treats `G39` as pump enable
- keep the firmware generic and let the server assign the capability; the node should sync it automatically during registration

### Observed Raw Ranges

- watering unit:
  - air: `~2100`
  - current soil: `~1800-1900`
  - water: `~1500-1560`
- earth unit:
  - air: `4095`
  - current soil: `~2400-2700`
  - water: `~1500`
- these are empirical reference values only, not calibration targets

### Moisture Normalization

- use a per-capability linear map from raw ADC to `0-100%`
- formula: `percent = clamp((dryRaw - raw) / (dryRaw - wetRaw) * 100)`
- current defaults:
  - earth: `dryRaw=4095`, `wetRaw=1500`
  - watering: `dryRaw=2100`, `wetRaw=1500`, `curveExponent=0.33`
- the UI must pick the curve from the node capability, not from a shared default
- the earth unit swings a lot for the same soil, so use a short sample window and median/trimmed average before mapping if you need steadier output
- the watering unit needs a curved response because its useful range is compressed; the exponent lifts the midrange wet readings toward the earth unit's more realistic percent
- keep the raw ADC value too; the percent is for UI and thresholds, not for losing the source signal

## Battery Options (Atom)

### TailBat (`T001`)

- capacity: `190mAh`
- simple tail battery accessory with power button and passthrough connectors
- straightforward mobile power add-on

### Atomic Battery Base (`A151`)

- capacity: `200mAh`
- adds boost/charge management and battery status features
- battery ADC monitoring support for `AtomS3 Lite` uses `G8`
- if `G8` is used for battery telemetry, avoid assigning `Earth AO` to `G8`
- physically occupies the Atom base interface; plan GPIO breakout access accordingly

## Scalable Provisioning Strategy

## 1) Universal Firmware

- flash one firmware image to every node
- do not bake per-node `node_id`
- do not bake server IP

## 2) Immutable Hardware Identity

- derive `hw_id` from ESP32-S3 unique identifier (MAC/efuse)
- keep `hw_id` immutable and use it as registration anchor

## 3) First-Boot Registration and Claim

- node calls register endpoint with `hw_id`, firmware version, and optional claim token
- server returns assigned logical `node_id` and config payload
- node stores config in NVS and runs with server-managed settings

## 4) Server Address as Config, Not Firmware Constant

- prefer URL over raw IP (DNS allows backend migration)
- config precedence:
  - NVS stored config
  - discovery default (for example `anthos.local` on LAN)
  - provisioning flow if unresolved

## 5) Onboarding UX

- preferred: BLE onboarding on unprovisioned boot
  - AtomS3 Lite supports BLE provisioning flows
  - phone sends Wi-Fi credentials, server URL, and claim token
- fallback: AP/captive portal mode for recovery
- always provide factory reset path to wipe NVS and re-enter provisioning

## Suggested Data Model

- `hardware_nodes`: immutable hardware identity (`hw_id`, first_seen, last_seen)
- `logical_nodes`: user-facing node identity (`node_id`, name, location, linked_hw_id)
- optional assignment history for replacement/reassignment traceability

## Rollout Plan

- implement server registration/claim endpoints
- add node-side NVS config and dynamic server URL support
- add BLE onboarding, keep AP mode fallback
- keep flash-time overrides only as temporary backward compatibility
