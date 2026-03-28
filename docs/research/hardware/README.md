# Hardware Research

## Summary

This folder contains the current hardware direction for the plant-monitoring prototype.

Approved Phase 1 stack:

- server: `Raspberry Pi 5` (`4 GB`)
- server storage: `64 GB microSD` by default
- node controller: `M5Stack AtomS3 Lite`
- node moisture probe: `Seeed Grove Capacitive Moisture Sensor (corrosion-resistant)`
- optional expansion on one node: `M5Stack Unit ENV-III`

Current hardware strategy:

- use one `Pi 5` as the local server/hub
- use two `AtomS3 Lite` nodes immediately so the architecture is tested properly
- keep moisture as the default capability
- add ambient sensing on only one experimental node first
- keep `SSD`, batteries, `ADC`, `NFC`, and polished enclosures as later upgrades

## Estimated Total Cost

Practical Phase 1 estimate:

- `Pi 5` server bundle: about `90-135 EUR`
- M5Stack/probe bundle: about `48.40 EUR` plus any extra cables you still need
- combined Phase 1 total: about `140-190 EUR`

What moves the total:

- whether you already own USB-C and Ethernet cables
- whether the chosen `microSD` is the cheaper local option or a nicer `A2` card
- whether you buy everything from one shop or split orders

## Final Approved Basket

This is the one-page basket to treat as the current approved purchase set.

### Server basket

- `1x Raspberry Pi 5` `4 GB`
- `1x official 27W USB-C Power Supply`
- `1x Pi 5 case with active cooling`
- `1x 64 GB microSD`, preferably `A2`
- `1x Ethernet cable` if needed

### Node basket

- `2x M5Stack AtomS3 Lite`
- `2x Seeed Grove Capacitive Moisture Sensor (corrosion-resistant)`
- `1x M5Stack Unit ENV-III`
- `2x USB-C data/power cables` if needed
- Grove/HY2.0 cable only if not already included with the selected parts

### Basket notes

- this is enough to validate one-node and two-node behavior
- this is enough to test the future capability-expansion path with one experimental node
- this intentionally avoids batteries, `ADC`, `SSD`, and `NFC` for now

## Hardware Architecture

```text
                    home network / ethernet / wifi

      +-----------------------------------------------+
      |            Raspberry Pi 5 server              |
      |-----------------------------------------------|
      | API / ingestion / storage / dashboard / admin |
      +-----------------------------------------------+
                    ^                          ^
                    |                          |
                    | Wi-Fi                    | Wi-Fi
                    |                          |
      +---------------------------+   +---------------------------+
      | Node A                    |   | Node B                    |
      | M5Stack AtomS3 Lite       |   | M5Stack AtomS3 Lite       |
      | + moisture probe          |   | + moisture probe          |
      +---------------------------+   | + ENV-III (experimental)  |
                                      +---------------------------+

      plant A record <-> node A assignment
      plant B record <-> node B assignment
```

Architecture intent:

- one local hub receives and stores all telemetry
- each plant node is small and single-purpose first
- one node carries the ambient expansion so the backend and UI can become capability-aware
- plant identity stays separate from node identity

## Approved Hardware List

### Server

- `Raspberry Pi 5` `4 GB`
- official `27W USB-C Power Supply`
- `Pi 5` case with active cooling
- high-quality `64 GB microSD`, preferably `A2`
- Ethernet connection

Why this is approved:

- reusable for other projects
- enough performance for API, database, dashboard, and local admin tasks
- cheaper and simpler than adding SSD hardware up front

### Node Platform

- `2x M5Stack AtomS3 Lite`
- `2x Seeed Grove Capacitive Moisture Sensor (corrosion-resistant)`
- `1x M5Stack Unit ENV-III`

Why this is approved:

- low-friction prototype path
- small node footprint
- clean expansion path without overbuilding Phase 1

## M5Stack Component Details

### Approved node controller

#### `M5Stack AtomS3 Lite`

- MCU: `ESP32-S3`
- role: standard per-plant node controller
- status: approved default

Why it won:

- modern enough to standardize on
- tiny form factor
- fits the M5Stack/Grove-style prototyping path well

### Researched but not selected as default

#### `M5Stack Atom Lite`

- MCU: older `ESP32` platform (`ESP32-PICO-D4` family)
- role: fallback if `AtomS3 Lite` is unavailable
- status: not the preferred starting point

Why it lost:

- older platform
- less attractive than `AtomS3 Lite` as the standard node family

## M5Stack Sensor / Module Details

### Approved moisture probe

#### `Seeed Grove Capacitive Moisture Sensor`

- type: capacitive moisture probe
- connector style: Grove
- role: default Phase 1 soil moisture probe
- status: approved default

Why it won:

- corrosion-resistant
- better fit than loose resistive probes
- simpler integration path for this prototype stack

### Approved optional expansion module

#### `M5Stack Unit ENV-III`

- sensors: temperature, humidity, pressure
- interface: `I2C`
- role: experimental ambient-sensing add-on for one node
- status: approved for one experimental node only

Why it is included:

- validates the future capability-expansion path
- avoids forcing extra hardware on every node immediately

### Conditional later module

#### `M5Stack Unit ADC`

- role: analog cleanup / acquisition helper
- status: buy later only if direct moisture readings are noisy

Why it is not approved by default:

- adds complexity early
- only useful if the chosen probe path proves unstable

## Purchasing Guidance

Current Belgium-friendly buying direction:

- first stop for M5Stack parts: `Reichelt Belgium`
- local Belgian alternative: `MC Hobby`
- nearby fallback: `TinyTronics`
- broader fallback: `BerryBase`

Current `microSD` buying guidance:

- target `64 GB`
- prefer reputable brands
- prefer `A2`, otherwise `A1`
- endurance card only if price difference is small

## What To Buy Now

- `Pi 5` server bundle
- `2x AtomS3 Lite`
- `2x moisture probes`
- `1x ENV-III`
- only the cables you actually need

## What To Buy Later

- `SSD` upgrade
- batteries
- `M5Stack Unit ADC`
- `NFC`
- polished enclosures
- volume extras

## Document Index

- `pi5-server-parts-list.md` - exact `Pi 5` server recommendation
- `server-options.md` - `Pi` vs `mini PC` comparison history and rationale
- `hardware-m5stack-setup.md` - M5Stack platform recommendation
- `m5stack-belgium-shopping.md` - Belgium-friendly M5Stack shop guidance
- `soil-moisture-probes.md` - moisture probe research and recommendation
- `phase1-shopping-list-belgium.md` - exact Phase 1 shopping list
- `buy-now-vs-buy-later.md` - staged purchasing guidance
