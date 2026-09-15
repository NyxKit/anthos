# Validation Record — 2026-09-15

## First increment results

| Check | Result | Evidence scope |
|---|---|---|
| `pnpm node:test:host` | Pass | Production cadence storage/restoration, sleep coordinator and response validator with controlled host boundaries |
| `pnpm --filter @anthos/api test` | Pass: 14 files, 35 tests | Includes direct log receipt-day files and legacy/current uptime fixtures through the real archive service |
| `pnpm --filter @anthos/api build` | Pass | Strict TypeScript API build with shared contracts |
| `pio run --project-dir node` | Pass | Production `m5atoms3` firmware; RAM 61,332 / 327,680 bytes; flash 1,396,397 / 3,342,336 bytes |
| `git diff --check` | Pass | Whitespace/error-marker check |

## Locally resolved build

PlatformIO resolved Espressif32 6.13.0, Arduino ESP32 framework `3.20017.241212+sha.dcc1105b`, BH1750 1.3.0, M5Unit-ENV `1.3.2+sha.b10e565`, M5Unified `0.2.14+sha.002b75f`, M5AtomS3 `1.0.2+sha.440c112`, FastLED 3.10.3, ArduinoJson 7.4.3, BME68x 1.3.40408, bsec2 1.10.2610 and NimBLE-Arduino 1.4.3. These are observed local resolutions, not a pinned reproducible dependency set. Existing ArduinoJson deprecation warnings remain.

## Limits and remaining evidence

- No device was flashed. No real sleep cycles, pump waveforms, reset/power-cut qualification, native BLE sessions or 24-hour fault soak were performed.
- Storage failures are injected at the Preferences boundary; actual NVS brownout behavior still requires hardware qualification.
- Host tests execute extracted production lifecycle decisions, not the complete `NodeApp` loop, HTTP stack, BLE tasks or sensor drivers.
- D05 cadence persistence, D15 direct log time and D17 grace-period rollover have software fixes and regression coverage. D02 has conservative sleep guards; durable reconciliation and bounded awake failure recovery remain open.
- Complete command/ACK/registration validation, capability coordination, metric freshness, device-confirmed cadence reporting, enrollment security, independent cutoff and resource budgets remain follow-up tasks. No claim of unattended watering safety or full spec acceptance is made.
- OD-001–OD-004 remain open in the source spec. See [tasks.md](tasks.md) for continuation work.
