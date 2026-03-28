# Soil Moisture Probe Research

## Goal

Choose the best soil moisture probe for the first `AtomS3 Lite` plant-monitoring nodes, with a preference for simple integration, low corrosion risk, and Belgium-friendly purchasing.

## Short Answer

Best Phase 1 choice:

- `Seeed Grove Capacitive Moisture Sensor (corrosion-resistant)`

Why:

- capacitive instead of resistive
- corrosion-resistant
- Grove-compatible connector, which is a much better fit for M5Stack-style prototyping
- available from `Reichelt Belgium`
- cheap enough to buy two immediately

## What Matters In A Probe

For your project, the probe should be:

- capacitive, not resistive
- cheap enough to duplicate across nodes
- easy to connect to `AtomS3 Lite`
- stable enough for calibration-based interpretation
- not a fully closed consumer ecosystem product

## What To Avoid

Avoid the very cheap resistive fork-style probes as your default.

Why:

- exposed metal corrodes
- readings drift over time
- they create unnecessary calibration pain
- they are fine for toy demos, not good as your product baseline

## Option 1 - Seeed Grove Capacitive Moisture Sensor

This is the current best recommendation.

Why it stands out:

- corrosion-resistant
- Grove connector
- sold as a soil moisture sensor for Arduino/Grove ecosystems
- available from `Reichelt Belgium`

Confirmed Belgium-friendly example:

- `Reichelt`: `GRV HUMIDITYSEN2` - `Arduino - Moisture sensor, floor, (corrosion-resistant)` - `6.09 EUR`

Why it fits your stack:

- M5Stack and Grove-style ecosystems already live in the same practical prototyping world
- easier cable story than custom loose-wire analog probes
- good fit for a first vertical slice

Tradeoffs:

- still a hobby/prototyping sensor, not a scientific probe
- you still need per-node calibration
- long-term waterproofing and physical mounting still matter

Verdict:

- best default Phase 1 probe

## Option 2 - DFRobot Capacitive Corrosion-Resistant Probe

Reference product:

- `DFRobot SEN0193`

What is attractive:

- capacitive
- corrosion-resistant
- clearly documented
- analog output with operating voltage `3.3V to 5.5V`
- marketed specifically for Arduino/Raspberry Pi style integration

What is less convenient here:

- not as plug-and-play with the M5Stack connector world
- more custom wiring story than a Grove-compatible option
- more likely to push you toward manual analog integration details early

Verdict:

- good technical fallback
- not the best first purchase if the Grove-compatible option is available locally

## Option 3 - Adafruit STEMMA Soil Sensor

What is attractive:

- capacitive
- no exposed metal
- digital `I2C` interface
- strong documentation

What is less convenient here:

- more cable/connector adaptation for this stack
- not the cheapest EU-first path for Belgium
- better as a polished sensor experiment than as the simplest first node sensor

Verdict:

- interesting sensor
- not my first recommendation for this project's earliest stage

## Option 4 - Generic Very Cheap Capacitive Probes

Example class:

- no-name analogue capacitive moisture sensor boards around `1-4 EUR`

Why they are tempting:

- extremely cheap

Why I would not make them your default:

- inconsistent quality
- inconsistent coatings and long-term durability
- more likely to waste time in debugging and calibration

Verdict:

- acceptable only if you want sacrificial experiments
- not ideal as the baseline probe for your platform decisions

## Recommended Choice

Buy:

- `2x Seeed Grove Capacitive Moisture Sensor (corrosion-resistant)`

Why this is the best call:

- fits the M5Stack prototyping ecosystem better than loose analog probes
- low enough price to duplicate early
- good enough quality level for Phase 1
- easy to source in Belgium-friendly EU channels

## Integration Notes

- Treat the probe as a relative sensor, not a precision moisture oracle.
- Calibrate per node.
- Expect different soils and pot sizes to shift the useful range.
- Store raw readings separately from normalized moisture values.

## Buying Recommendation For Belgium

First shop to check:

- `Reichelt Belgium`

Concrete item to target:

- `GRV HUMIDITYSEN2` - `6.09 EUR`

## Bottom Line

For your first real nodes, do not overcomplicate this.

Use:

- `AtomS3 Lite`
- `Seeed Grove capacitive corrosion-resistant moisture probe`

That is the cleanest balance between affordability, compatibility, and realism.

## Sources

- DFRobot `SEN0193` product page
- Adafruit STEMMA Soil Sensor guide
- `Reichelt Belgium` soil moisture sensor listings
