# Hardware Research

## Summary

- server: `Docker-capable always-on host` (`NAS`, `Pi`, mini PC, or other machine)
- nodes: `2x M5Stack AtomS3 Lite`
- ambient sensors: `2x M5Stack Unit ENV-III` or compatible `M5Stack ENV` unit
- light sensors: `2x M5Stack Ambient Light Sensor Unit`
- moisture modules: `2x M5Stack Earth Unit`
- expansion: `2x M5Stack 1-3 Hub Unit`

## Exact Hardware To Buy

- server
  - no dedicated server hardware is required yet if an existing `NAS` or other Docker host is available
  - `Raspberry Pi` remains an optional dedicated deployment target, not a requirement
- nodes
  - `2x M5Stack AtomS3 Lite` (`https://www.tinytronics.nl/en/development-boards/microcontroller-boards/with-wi-fi/m5stack-atom-s3-lite-esp32-s3-development-board`)
  - `2x M5Stack Unit ENV-III` (`https://www.tinytronics.nl/en/sensors/air/pressure/m5stack-env-iii-unit`)
  - `2x M5Stack Ambient Light Sensor Unit` (`https://www.tinytronics.nl/en/sensors/optical/light-and-color/m5stack-ambient-light-sensor-unit`)
  - `2x M5Stack Earth Unit` (`https://www.tinytronics.nl/en/platforms-and-systems/m5stack/unit/m5stack-earth-unit`)
  - `2x M5Stack 1-3 Hub Unit` (`https://www.tinytronics.nl/en/cables-and-connectors/connectors/grove-compatible/m5stack-1-3-hub-unit`)
  - optional development fallback while `ENV-III` is out of stock: `1x M5Stack ENV Pro Unit (BME688)`
  - optional accessory for separate `Earth` wiring: `Grove/HY2.0 to Dupont` adapter cable

## Node Cost

- `2x AtomS3 Lite` at `10.75 EUR` = `21.50 EUR`
- `2x ENV-III` at `7.75 EUR` = `15.50 EUR`
- `2x Ambient Light Sensor Unit` at `7.00 EUR` = `14.00 EUR`
- `2x Earth Unit` at `4.00 EUR` = `8.00 EUR`
- `2x 1-3 Hub Unit` at `4.25 EUR` = `8.50 EUR`
- node subtotal before shipping = `67.50 EUR`

## Node Hardware

- controller: `M5Stack AtomS3 Lite` (`ESP32-S3`)
- ambient: `M5Stack Unit ENV-III` or another compatible `M5Stack ENV` unit
- light: `M5Stack Ambient Light Sensor Unit`
- moisture: `M5Stack Earth Unit`
- expansion: `M5Stack 1-3 Hub Unit`

## Phase 1 Usage

- develop the server first on an existing machine or `NAS` using Docker
- use one Atom node as the firmware integration target first
- treat the node firmware as a product-style base that tolerates missing sensors cleanly
- start with the shared `I2C` stack first: `Ambient Light Sensor Unit` and later `ENV-III` / `ENV Pro`
- treat `Earth Unit` as a separate-path moisture experiment, not a shared-hub plug-and-play module

## Hardware Architecture

```text
                    home network / ethernet / wifi

      +------------------------------------------------------+
      |         Docker-capable local server host             |
      |------------------------------------------------------|
      | NAS / Pi / mini PC / desktop                         |
      | API / ingestion / storage / dashboard / admin        |
      +------------------------------------------------------+
                    ^                          ^
                    |                          |
                    | Wi-Fi                    | Wi-Fi
                    |                          |
      +---------------------------+   +---------------------------+
      | Node A                    |   | Node B                    |
      | M5Stack AtomS3 Lite       |   | M5Stack AtomS3 Lite       |
      | + moisture probe          |   | + moisture probe          |
       | + ENV unit                |   | + ENV unit                |
       | + ambient light unit      |   | + ambient light unit      |
       | + earth unit (separate)   |   | + earth unit (separate)   |
       | + 1-3 hub for I2C units   |   | + 1-3 hub for I2C units   |
       +---------------------------+   +---------------------------+

      plant A record <-> node A assignment
      plant B record <-> node B assignment
```

## Per-Node Connection Map

```text
AtomS3 Lite
  -> 1-3 Hub Unit
       -> ENV-III
       -> Ambient Light Sensor Unit

Earth Unit
  -> separate GPIO/power path when used
```

- `AtomS3 Lite` provides power, firmware, and Wi-Fi connectivity
- `1-3 Hub Unit` is only valid for compatible shared-bus units on the Atom's HY2.0 port
- `ENV-III` and `Ambient Light Sensor Unit` are `I2C` modules and can share that hub
- `Earth Unit` is `analog + digital`, not `I2C`, so it does not cleanly share the passive hub with those modules
- `Earth Unit` works either alone on the HY2.0 port or via separate wiring to other Atom GPIOs

## Notes

- a `Pi 5` is optional; current development can use a local machine or `NAS` Docker host
- the `1-3 hub` is appropriate for `I2C` unit sharing, not for mixing `Earth Unit` with the `I2C` units
- if `ENV-III` stock blocks progress, `ENV Pro Unit (BME688)` is a viable development substitute for one node
- if `Earth Unit` must coexist with the `I2C` stack on one Atom, it needs a separate wiring path off the shared HY2.0 port
- keep controller docs model-specific: `Atom`, `Atom Lite`, and `AtomS3 Lite` differ in pins, examples, and firmware assumptions
- when hardware behavior seems inconsistent after flashing, double-check that the reference docs match the exact controller variant in hand
- keep batteries, `ADC`, `NFC`, and `SSD` as later upgrades

## Key Docs

- `https://docs.m5stack.com/en/core/AtomS3%20Lite` - primary controller doc for the current node hardware
- `https://docs.m5stack.com/en/core/ATOM%20Lite` - older Atom Lite reference; useful for comparison, but not interchangeable with `AtomS3 Lite`
- `two-shop-basket.md` - final purchase split, subtotals, totals
- `webshop-urls.md` - raw shop/search/product URLs
- `pi5-server-parts-list.md` - Pi 5 server notes
- `soil-moisture-probes.md` - moisture probe options
