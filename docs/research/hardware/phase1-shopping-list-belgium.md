# Phase 1 Shopping List For Belgium

## Goal

Create the exact shopping list for Phase 1: one local server and two moisture-monitoring nodes, with enough hardware to validate the architecture properly.

## Phase 1 Scope

This shopping list assumes:

- `1` server
- `2` plant-monitoring nodes
- moisture sensing on both nodes
- ambient sensing on both nodes
- lux sensing on both nodes
- wired server networking
- USB-powered nodes for the first phase

## Recommended Shops

Primary shopping path:

- `Pi 5` parts: Belgium/EU Raspberry Pi shop of your choice
- M5Stack + probe parts: `Reichelt Belgium`

Why:

- `Reichelt` already gave us concrete, Belgium-visible pricing for key M5Stack items and shipping from `6.95 EUR`

## Exact Phase 1 List

## Server

### Raspberry Pi 5 server bundle

- `1x Raspberry Pi 5 4 GB`
- `1x official 27W USB-C power supply`
- `1x Pi 5 case with active cooling`
- `1x high-quality 64 GB microSD`, preferably `A2` and from a reputable brand
- `1x Ethernet cable` if you do not already have one

Belgium-friendly microSD examples:

- `Reichelt`: `Raspberry Pi - MicroSD card, A2-Class, 64 GB` - `24.08 EUR`
- `Reichelt`: `SanDisk 64 GB A2/U3/V30` - around `28.20 EUR` when available
- `MC Hobby`: `64 GB Class 10 / UHS-I SDXC` - `17.67 EUR`

Why this version:

- enough performance
- reusable beyond this project
- `64 GB` is already plenty for your current server scope
- this is usually the best-value storage point in practice

## Node hardware

### Controllers

- `2x M5Stack AtomS3 Lite`

Confirmed price example:

- `Reichelt`: `11.08 EUR` each

Subtotal:

- `22.16 EUR`

### Moisture probes

- `2x Seeed Grove Capacitive Moisture Sensor (corrosion-resistant)`

Confirmed price example:

- `Reichelt`: `GRV HUMIDITYSEN2` at `6.09 EUR` each

Subtotal:

- `12.18 EUR`

### Ambient expansion

- `2x M5Stack Unit ENV-III`

Confirmed price example:

- `Reichelt`: `7.11 EUR` each

Subtotal:

- `14.22 EUR`

### Lux sensors

- `2x M5Stack DLight (BH1750, Grove, I2C)`

Confirmed price example:

- `MC Hobby`: `M5Stack: Capteur luminosite ambiante (BH1750FVI-TR), Grove, I2C` - `7.80 EUR` each

Subtotal:

- `15.60 EUR`

## Likely supporting accessories

### USB-C cables for node flashing/power

- `2x USB-C data/power cables` for the `AtomS3 Lite` nodes

Why:

- one per node makes setup easier
- you may already own these, so this can be omitted if available

### Grove / HY2.0 cables

- add only if the selected sensor/module packaging does not already include the cable you need

Why:

- many unit modules include one cable, but do not assume blindly when ordering

### Simple enclosure / mounting materials

- optional small enclosure or printed mount for each node
- QR labels later

Why:

- useful, but not required to validate the platform loop

## Confirmed M5Stack-Side Cost

Using the confirmed `Reichelt` items only:

- `2x AtomS3 Lite = 22.16 EUR`
- `2x moisture probes = 12.18 EUR`
- `2x ENV-III = 14.22 EUR`
- `2x DLight = 15.60 EUR`

Subtotal before cables/shipping:

- `64.16 EUR`

Add shipping:

- from `6.95 EUR`

So the M5Stack/probe part of Phase 1 is roughly:

- about `71.11 EUR` plus any extra cables you still need

## Suggested Purchase Split

## Order 1 - Core hardware

- `Pi 5` bundle
- `2x AtomS3 Lite`
- `2x moisture probes`
- `2x ENV-III`
- `2x DLight (BH1750)`

This is the exact Phase 1 purchase I recommend.

## Order 2 - Only if missing locally

- spare cables
- nicer enclosure parts
- labels / tags

Do this only after checking what is already included and what you already own.

## Why Two Nodes Immediately

Do not buy only one node unless budget forces it.

Why:

- node two is what reveals whether the architecture is real
- you will need the second node soon anyway
- the incremental hardware cost is low compared with the value of the learning

## Bottom Line

Phase 1 exact buy list:

- `1x Raspberry Pi 5 4 GB`
- `1x official Pi 5 PSU`
- `1x cooled Pi 5 case`
- `1x high-quality 64 GB microSD`
- `2x M5Stack AtomS3 Lite`
- `2x Seeed Grove capacitive corrosion-resistant moisture probe`
- `2x M5Stack Unit ENV-III`
- `2x M5Stack DLight (BH1750, Grove, I2C)`
- `2x USB-C cables` if needed
- `1x Ethernet cable` if needed
