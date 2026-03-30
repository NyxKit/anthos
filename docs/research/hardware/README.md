# Hardware Research

## Summary

- server: `Raspberry Pi 5 8GB Starter Pack`
- nodes: `2x M5Stack AtomS3 Lite`
- ambient sensors: `2x M5Stack Unit ENV-III`
- light sensors: `2x M5Stack Ambient Light Sensor Unit`
- moisture modules: `2x M5Stack Earth Unit`
- expansion: `2x M5Stack 1-3 Hub Unit`

## Exact Hardware To Buy

- server
  - `Raspberry Pi 5 8GB Starter Pack` (`https://www.raspberrystore.nl/PrestaShop/nl/raspberry-pi-5/513-raspberry-pi-5-8gb-starter-pack-2023-8718734751687.html`)
- nodes
  - `2x M5Stack AtomS3 Lite` (`https://www.tinytronics.nl/en/development-boards/microcontroller-boards/with-wi-fi/m5stack-atom-s3-lite-esp32-s3-development-board`)
  - `2x M5Stack Unit ENV-III` (`https://www.tinytronics.nl/en/sensors/air/pressure/m5stack-env-iii-unit`)
  - `2x M5Stack Ambient Light Sensor Unit` (`https://www.tinytronics.nl/en/sensors/optical/light-and-color/m5stack-ambient-light-sensor-unit`)
  - `2x M5Stack Earth Unit` (`https://www.tinytronics.nl/en/platforms-and-systems/m5stack/unit/m5stack-earth-unit`)
  - `2x M5Stack 1-3 Hub Unit` (`https://www.tinytronics.nl/en/cables-and-connectors/connectors/grove-compatible/m5stack-1-3-hub-unit`)

## Node Cost

- `2x AtomS3 Lite` at `10.75 EUR` = `21.50 EUR`
- `2x ENV-III` at `7.75 EUR` = `15.50 EUR`
- `2x Ambient Light Sensor Unit` at `7.00 EUR` = `14.00 EUR`
- `2x Earth Unit` at `4.00 EUR` = `8.00 EUR`
- `2x 1-3 Hub Unit` at `4.25 EUR` = `8.50 EUR`
- node subtotal before shipping = `67.50 EUR`

## Node Hardware

- controller: `M5Stack AtomS3 Lite` (`ESP32-S3`)
- ambient: `M5Stack Unit ENV-III`
- light: `M5Stack Ambient Light Sensor Unit`
- moisture: `M5Stack Earth Unit`
- expansion: `M5Stack 1-3 Hub Unit`

## Phase 1 Usage

- buy the fuller node hardware now
- use only the minimum needed features first
- Phase 1 software can stay focused on node identity, moisture reporting, and multi-node ingestion
- ambient light and temperature/humidity/pressure can remain present in hardware without being fully used yet

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
      | + ambient light unit      |   | + ambient light unit      |
      | + earth unit              |   | + earth unit              |
      | + 1-3 hub                 |   | + 1-3 hub                 |
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
       -> Earth Unit
```

- `AtomS3 Lite` provides power, firmware, and Wi-Fi connectivity
- `1-3 Hub Unit` is required because the Atom exposes only one HY2.0-4P port
- `ENV-III` and `Ambient Light Sensor Unit` are sensor modules
- `Earth Unit` provides soil-moisture sensing only

## Notes

- buy `2` complete nodes immediately
- keep the server on the `Pi 5`
- the `1-3 hub` is required because `AtomS3 Lite` only exposes one HY2.0-4P port and each node now has three attached M5Stack units
- keep batteries, `ADC`, `NFC`, and `SSD` as later upgrades

## Key Docs

- `two-shop-basket.md` - final purchase split, subtotals, totals
- `webshop-urls.md` - raw shop/search/product URLs
- `pi5-server-parts-list.md` - Pi 5 server notes
- `soil-moisture-probes.md` - moisture probe options
