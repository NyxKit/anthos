# Verification: First Hardening Increment

Run from the repository root:

```bash
pnpm install
pio pkg install --project-dir node
pnpm node:test:host
pnpm --filter @anthos/api test
pnpm --filter @anthos/api build
pio run --project-dir node
git diff --check
```

The host runner requires Python 3 and a C++17 compiler (`c++`, or the executable named by `CXX`). It compiles production `NvsConfig`, `AppConfig`, `PowerPolicy`, `SleepCoordinator` and `DeviceResponseValidator` against storage/Arduino stubs and the same locally resolved ArduinoJson headers as the firmware. Temporary test binaries are removed automatically.

Host coverage includes all presets across three simulated reconstructions, invalid/missing/wrong-type storage, failed opens/writes, duplicate-write avoidance, an active action or pending outcome, final-poll profile changes, failed final polls, clock wrap and malformed response envelopes. API tests verify receipt-day archive files and retained uptime for old and new firmware payloads.

These commands compile firmware and run host/server checks. They do not upload firmware or perform physical actuation. Hardware-dependent acceptance is listed in [tasks.md](tasks.md); the original device pump test is not a substitute for cutoff or power-cut qualification.
