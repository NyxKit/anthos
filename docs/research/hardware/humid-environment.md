# Humid Environment Hardware Research

## Goal

Understand what parts of the current `M5Stack` node stack are reasonably tolerant of humid environments, water droplets, spray bottle mist, and incidental watering, and what needs extra protection.

## Short Answer

- Humidity alone is usually not the immediate failure mode.
- Direct droplets, splash, fertilizer residue, and condensation are the real risks.
- `3D` printing a case helps, but only as partial protection.
- A printed case does not make the electronics waterproof.

## What Is Usually Durable Enough

These parts can generally survive a humid room if they are kept out of direct spray and do not sit in standing moisture:

- `M5Stack AtomS3 Lite` itself, if used as a dry, enclosed controller
- cables and connectors that stay dry
- plastic sensor housings that are not exposed metal
- capacitive soil moisture probes, if the sensing end is meant to live in the soil and the electronics are kept dry

Humidity by itself is often survivable for consumer electronics. The bigger problem is when moisture gets onto boards, connectors, or exposed conductors and then sits there.

## What Is Not Durable Against Water Droplets

These are the parts most likely to cause trouble:

- open PCBs with exposed pads or headers
- unsealed connectors
- bare solder joints near spray or condensation
- resistive soil probes with exposed metal
- modules mounted where water can drip down into ports
- enclosures with gaps that let spray or wet air cycle in and out repeatedly

For this project, the highest-risk failure mode is not the `ESP32-S3` chip dying instantly. It is corrosion, intermittent contact, and sensor drift.

## Main Wiring Constraint

The moisture sensor is the awkward part of the layout:

- `Earth Unit` and `Watering Unit` do not live on the shared Grove/I2C hub path
- the moisture sensor must be wired separately to the bottom pins on the `AtomS3 Lite`
- that separate wiring preserves the analog and digital moisture functionality
- the shared hub stays reserved for the other compatible units

That means the case must protect both the controller and the extra moisture wiring, not just the visible front-facing modules.

## Different Setup Families

This is the decision map for the likely branches. Nothing here is final yet.

| Setup family | Case count | Summary | Main benefit | Main risk |
| --- | --- | --- | --- | --- |
| Absolute basic | 1 | `DLight + ENV + Earth + TailBat + Atom`, no pump | simplest hardening path | bottom-pin moisture wiring still needs care |
| Pump wired | 1 or 2 | `DLight + ENV + Watering + TailBat + Atom`, wired power/control | keeps a powered pump path simple | wet-side and dry-side boundaries can get messy |
| Pump non-wired | 2+ | `DLight + ENV + Watering + TailBat + Atom`, solar + powerbank capable | best path for greenhouse power independence | most enclosure and power-domain complexity |

### 1. Absolute Basic

Setup:

- `DLight + ENV + Earth + TailBat + Atom`
- no pump
- one wet-facing node class only

Working assumption:

- one case for the full node
- no diversification between wired and non-wired power paths
- the bottom-pin moisture wiring is the main thing that needs protection
- this is the simplest version to harden first

### 2. Pump Wired

Setup:

- `DLight + ENV + Watering + TailBat + Atom`
- pump is present
- node remains wired for power and control

Possible case directions:

1. single dry brain case
- one enclosure for the Atom, TailBat, and control wiring
- pump-related wiring exits through a protected cable path
- good if the pump can stay physically separate from the controller chamber
- best when the pump is not expected to live inside the same wet enclosure

2. split wet/dry pair
- one dry controller case
- one separate pump or watering-side case closer to the water path
- better if the pump side needs its own protection, routing, or maintenance access
- more complex, but gives a clearer boundary between electronics and water

Open question:

- do we want the pump hardware inside the same enclosure family as the brain, or do we want a separate wet-side module from day one?

### 3. Pump Non-Wired

Setup:

- `DLight + ENV + Watering + TailBat + Atom`
- pump exists, but the node power story is not hard-wired to mains
- extension path for `solar panel + powerbank`

Power model assumption:

- solar panel stays outside the greenhouse
- solar panel charges a powerbank
- powerbank lives in a dry protected place, ideally inside but fully protected from rain and splash
- the powerbank can feed multiple nodes inside the greenhouse
- `TailBat` becomes optional extra storage rather than a requirement
- many powerbanks shut their output off when the load is too small, too bursty, or too intermittent
- a high battery percentage does not guarantee the USB output stays on
- if a node eventually dies while the bank still reports charge, the powerbank output policy is a likely suspect

Possible case directions:

1. shared solar power stack
- one protected powerbank enclosure
- multiple dry node brains powered from that source
- each brain needs strong water protection because the bottom pins remain exposed to the humid interior environment
- simplest way to share one power source across multiple greenhouse nodes

2. distributed node batteries
- each node has its own protected brain plus optional `TailBat`
- the solar and powerbank system still exists, but it only tops up or feeds the shared power path
- more modular, but more pieces to protect and maintain
- better if nodes need to be moved, replaced, or expanded independently

Open question:

- do we want the greenhouse to behave like one shared power domain, or like several independent nodes that happen to be solar-assisted?

Design note:

- in the non-wired greenhouse version, the brain protection matters more than the battery choice
- the `Atom` and `TailBat` should live in a very dry enclosure
- the bottom-pin moisture wiring still has to exit the enclosure cleanly
- the sensors can live in the moist environment
- the power source can be external or shared, but the brain cannot be treated as moisture-tolerant just because it is battery powered
- prefer a powerbank or power path with an always-on / low-current mode if the node is expected to run continuously

## Likely Failure Modes

- condensation on the PCB causing temporary shorts
- corrosion on pins and connector contacts
- moisture inside cables wicking into connectors
- false sensor readings after residue builds up
- long-term drift from repeated wet/dry cycles
- enclosure trapping damp air and making the inside stay wet longer than the outside

## What `3D` Printing Helps With

A printed case helps with:

- blocking direct spray and drips
- reducing dust and soil contamination
- giving the node a more product-like mounting surface
- providing strain relief and a controlled cable exit

It does not automatically solve:

- condensation
- steam-like humidity trapped inside the case
- water entering through the cable hole
- splash coming from the bottom or back
- corrosion if the electronics are already exposed

## What Makes A Printed Case Actually Useful

If you `3D` print an enclosure, it should be treated as a splash shield, not a waterproof shell.

Use:

- cable glands or tight cable exits
- a lid that closes consistently
- the controller mounted above the lowest point of any moisture path
- ventilation only where needed, and not facing spray
- internal spacing so the PCB is not touching the wall of the enclosure
- a separate protected exit path for the bottom-pin moisture wiring

Avoid:

- open slots facing the plant or pump
- mounting the board directly below a connector opening
- sealed boxes with wet air trapped inside forever
- putting the electronics in the same chamber as wet soil or the pump outlet
- routing the moisture wire through the same opening as a splash-prone cable bundle without strain relief

## Practical Recommendation For Anthos

For the current architecture:

- keep the `AtomS3 Lite` and hub wiring inside a dry enclosure
- keep probes outside the enclosure where they belong
- keep pump tubing and spray paths physically separate from the controller box
- treat the enclosure as splash resistance, not water protection
- assume the node can be exposed to repeated humidity cycles and design for maintenance

## Good Protection Strategy

Best layered approach:

1. Place electronics in a printed or off-the-shelf enclosure.
2. Route cables through strain-relieved exits.
3. Keep the enclosure above splash level and away from direct spray.
4. Prefer capacitive sensors and sealed connectors over exposed metal.
5. Inspect and replace corroding parts early.

## Bottom Line

`3D` printing a case helps, but only if the goal is to reduce direct water exposure.

If the environment regularly gets sprayed or dripped on, the real solution is:

- enclosure design
- cable management
- connector selection
- avoiding exposed metal where possible
- keeping electronics dry by placement, not by wishful thinking

Humidity is manageable. Water droplets are the problem.
