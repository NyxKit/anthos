# Buy Now Vs Buy Later

## Goal

Avoid over-ordering while still buying enough to validate Phase 1 properly.

## Buy Now

These are the parts I would buy immediately.

### Server

- `Raspberry Pi 5 4 GB`
- official `27W` PSU
- cooled case
- high-quality `64 GB microSD`

### Nodes

- `2x M5Stack AtomS3 Lite`
- `2x Seeed Grove capacitive corrosion-resistant moisture probes`
- `1x M5Stack Unit ENV-III`

### Basic accessories

- `2x USB-C cables` if you do not already own them
- Ethernet cable if needed
- any required Grove/HY2.0 cable not included in the selected products

Why these are buy-now:

- they directly support the first architecture milestone
- they let you test both one-node and two-node behavior
- they avoid premature hardware branching

## Buy Later

These should wait until the first prototype loop works.

### Node extras

- extra `ENV-III` modules for every node
- ADC bridge modules
- batteries and battery-management accessories
- custom enclosures beyond a simple prototype mount
- NFC hardware

### Server extras

- UPS / backup power
- fancy case upgrades
- SSD upgrade if you later want a more durable long-lived server setup

### Productization items

- printed labels in volume
- polished QR tag system
- replacement node stock
- premium identity hardware

Why these are buy-later:

- they do not help validate the core loop first
- they create extra variables
- they are easier to choose after you learn from the first two nodes

## Conditional Buy Later

These are only worth buying after an early test reveals a real need.

### `M5Stack Unit ADC`

Buy later if:

- the direct probe readings are noisy
- analog acquisition quality becomes a real issue
- calibration feels unstable for the chosen probe

Otherwise:

- skip it for now

### Additional moisture probes

Buy later if:

- the first two probes prove stable and you want more plants immediately

### Better enclosure parts

Buy later if:

- your prototype wiring and mounting approach has stabilized

## Best Spending Discipline

The right early spending shape is:

- enough hardware to validate the platform
- not so much hardware that you start solving future problems too early

That means:

- buy `2` real nodes now
- buy `1` experimental ambient module now
- defer everything else until the first end-to-end loop is stable

## Bottom Line

Buy now:

- server
- two node controllers
- two moisture probes
- one ambient module
- only the cables you actually need

Buy later:

- ADC
- batteries
- NFC
- polished enclosures
- volume extras
