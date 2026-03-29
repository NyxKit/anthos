# Hardware Research

## Summary

This folder contains the current hardware direction for the plant-monitoring prototype.

Approved Phase 1 stack:

- server: `Raspberry Pi 5` (`4 GB`)
- server storage: `64 GB microSD` by default
- node controller: `M5Stack AtomS3 Lite`
- node moisture probe: `Seeed Grove Capacitive Moisture Sensor (corrosion-resistant)`
- ambient sensor: `2x M5Stack Unit ENV-III`
- light sensor: `2x M5Stack DLight (BH1750, Grove, I2C)`

Current hardware strategy:

- use one `Pi 5` as the local server/hub
- use two `AtomS3 Lite` nodes immediately so the architecture is tested properly
- keep moisture as the default capability
- buy ambient and lux sensors for both nodes up front to avoid a second shipping round
- keep `SSD`, batteries, `ADC`, `NFC`, and polished enclosures as later upgrades

Current approved purchasing path:

- use the two-shop basket in `two-shop-basket.md`
- `Reichelt` for the M5Stack core hardware
- `TinyTronics` for lux sensors and moisture probes

## Estimated Total Cost

Practical Phase 1 estimate:

- `Pi 5` server bundle: about `90-135 EUR`
- M5Stack/probe bundle: about `78.02 EUR` plus any extra cables you still need
- combined Phase 1 total: about `170-220 EUR`

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
- `2x capacitive moisture probes` from the approved two-shop basket
- `2x M5Stack Unit ENV-III`
- `2x BH1750 lux sensors`
- `2x USB-C data/power cables` if needed
- Grove/HY2.0 cable only if not already included with the selected parts

### Basket notes

- this is enough to validate one-node and two-node behavior
- this is enough to test ambient and lux sensing on both nodes without a second order
- this intentionally avoids batteries, `ADC`, `SSD`, and `NFC` for now

Approved basket reference:

- see `two-shop-basket.md` for the exact URLs, subtotals, and the preferred shop split

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
      | + ENV-III                 |   | + ENV-III                 |
      | + DLight (BH1750)         |   | + DLight (BH1750)         |
      +---------------------------+   +---------------------------+

      plant A record <-> node A assignment
      plant B record <-> node B assignment
```

Architecture intent:

- one local hub receives and stores all telemetry
- each plant node is small and single-purpose first
- both nodes can carry the same hardware, but the backend should still remain capability-aware
- plant identity stays separate from node identity

## Decision Log

### Why `Raspberry Pi 5` was approved

- you already had interest in buying one for other projects
- it gives enough headroom for this project without becoming wasteful in your wider setup
- it keeps the server compact and product-like

Rejected as the current default:

- `mini PC`: easier pure server path, but less aligned with your multi-project SBC interest
- `Pi 4`: cheaper, but less compelling once `Pi 5` already has shared value for you

### Why `64 GB microSD` was approved as default storage

- capacity is already more than enough for Phase 1
- it avoids extra SSD hardware complexity up front
- `64 GB` is usually the best value point

Rejected as the current default:

- `SSD`: nicer long-term, but unnecessary for the first purchase
- smaller cards: usually not enough cheaper to justify optimizing downward

### Why `M5Stack AtomS3 Lite` was approved

- small enough for per-plant nodes
- modern `ESP32-S3` platform
- good fit for a reusable node family

Rejected as the current default:

- `Atom Lite`: still usable, but older and less attractive as the standard platform
- Raspberry Pi per node: too expensive, power-hungry, and operationally heavy

### Why the `Seeed Grove Capacitive Moisture Sensor` was approved

- capacitive design avoids the worst corrosion problems of resistive probes
- Grove-style integration is friendlier for this prototype stack
- available from Belgium-friendly shops

Rejected as the current default:

- cheap resistive probes: too corrodable and drift-prone
- random generic capacitive boards: tempting on price, but less trustworthy as the baseline
- more premium closed consumer sensors: not suitable as your open prototype platform

### Why `2x M5Stack Unit ENV-III` were approved

- unit cost is low enough that avoiding a second shipping round is sensible
- it gives you matching hardware on both nodes from the start
- it still supports the future expansion path cleanly

### Why `2x M5Stack DLight (BH1750)` were approved

- lux sensing is relevant enough to plant monitoring to justify buying up front
- the `BH1750` class is more meaningful than a crude light/dark sensor
- the extra cost is small compared with the annoyance of another order later

Rejected as the current default:

- `M5Stack Unit Light`: acceptable for rough light/dark sensing, but weaker as a plant-light metric
- buying only one lux sensor: cheaper, but not worth the second-shipping annoyance in your case

### Why `M5Stack Unit ADC` was not approved by default

- it only helps if the direct probe reading path proves weak in practice
- delaying it keeps the first prototype simpler

Approved later if:

- moisture readings are noisy
- calibration quality is poor
- direct analog acquisition becomes a real bottleneck

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
- `2x M5Stack Unit ENV-III`
- `2x M5Stack DLight (BH1750, Grove, I2C)`

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

#### `Capacitive moisture probe`

- type: capacitive moisture probe
- role: default Phase 1 soil moisture probe
- status: approved default

Why it won:

- corrosion-resistant
- better than resistive probes
- available through the approved two-shop purchasing path

Approved purchasing variants:

- pragmatic default: generic capacitive moisture probe from `TinyTronics`
- slightly safer branded option: `DFRobot Gravity Analog Capacitive Soil Moisture Sensor` from `TinyTronics`

### Approved ambient module

#### `M5Stack Unit ENV-III`

- sensors: temperature, humidity, pressure
- interface: `I2C`
- role: temperature, humidity, and pressure module for both nodes
- status: approved default

Why it is included:

- low enough cost to justify buying both now
- keeps node hardware symmetrical

### Approved lux sensor

#### `BH1750 lux sensor`

- type: ambient light / lux sensor
- interface: `I2C`
- role: default lux sensor for both nodes
- status: approved default

Why it won:

- better plant-light signal than a simple photoresistor-style module
- low price for a meaningful metric
- available cheaply through the approved two-shop purchasing path

### Conditional later module

#### `M5Stack Unit ADC`

- role: analog cleanup / acquisition helper
- status: buy later only if direct moisture readings are noisy

Why it is not approved by default:

- adds complexity early
- only useful if the chosen probe path proves unstable

## Purchasing Guidance

Current Belgium-friendly buying direction:

- approved split: `Reichelt` + `TinyTronics`
- `Reichelt` for `AtomS3 Lite` and `ENV-III`
- `TinyTronics` for `BH1750` and moisture probes
- local Belgian alternative for some items: `MC Hobby`
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
- `two-shop-basket.md` - final approved `Reichelt + TinyTronics` basket
- `webshop-urls.md` - raw webshop/search/product URLs
