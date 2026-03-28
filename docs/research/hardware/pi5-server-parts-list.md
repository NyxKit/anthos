# Raspberry Pi 5 Server Recommendation

## Goal

Define a concrete `Raspberry Pi 5` server setup for the plant-monitoring hub, with a practical parts list you can actually buy.

## Recommended Build

This is the recommended `Pi 5` server configuration for your roadmap:

- `Raspberry Pi 5` 4 GB
- official `27W USB-C Power Supply`
- case with active cooling
- high-quality `64 GB microSD` as the default Phase 1 storage
- Ethernet connection to the local network
- optional HDMI only for first-time setup or debugging

Why this build:

- enough performance for API, database, dashboard, and future expansion
- reusable for other projects
- small and product-like compared to a mini PC
- strong enough that you are unlikely to outgrow it quickly

## Exact Parts List

## Core Required Parts

### 1. Main board
- `Raspberry Pi 5` 4 GB

Why this version:

- enough RAM for your current workload
- lower cost than `8 GB`
- good balance for a local server and dashboard

When to choose `8 GB` instead:

- you expect to run extra services beyond this project
- you want broader reuse for heavier projects
- the price difference is small enough to not matter much

### 2. Power supply
- official `Raspberry Pi 27W USB-C Power Supply`

Why:

- reduces power weirdness
- avoids underpowering surprises
- the easiest safe default for `Pi 5`

### 3. Cooling / case
- one `Pi 5` case with active cooling

Recommended characteristics:

- integrated fan or official active cooler support
- decent airflow
- easy access to ports
- not oversized or gimmicky

Why:

- `Pi 5` benefits from more deliberate cooling than older Pis
- the server may run continuously
- you want stable operation without thermal fuss

### 4. Storage

Recommended default:

- high-quality `64 GB microSD`

Why `64 GB`:

- plenty of room for Phase 1 and well beyond
- often the best value point because smaller cards are not much cheaper anymore
- keeps the initial server simple

Upgrade later only if needed:

- SSD-based storage path

Why SSD is still worth keeping in mind later:

- better long-term durability for always-on write-heavy use
- cleaner upgrade path if the Pi becomes a long-lived server

## Storage Options

## Option A - Default Phase 1 Choice

- high-quality `64 GB microSD`
- reputable brand
- endurance-oriented card if price is close

Choose this if:

- you want the simplest first purchase
- you do not need server-grade storage immediately
- you want the best value point rather than the absolute smallest capacity

## Option B - Best Long-Term Choice

- `Pi 5`
- SSD/NVMe-capable storage accessory or HAT/case solution
- `128 GB` SSD is already plenty

Choose this if:

- you want the cleanest server setup
- this device may stay in service for a long time
- you want fewer storage-related worries

## Networking

Recommended:

- wired Ethernet

Why:

- more stable for a home hub
- simpler than relying on Wi-Fi for an always-on server
- easier to reason about when debugging connectivity issues

## microSD Guidance

For this project, do not optimize for maximum capacity. Optimize for decent quality at the `64 GB` value point.

What to prefer:

- reputable brands
- cards sold by trustworthy EU retailers
- `A2` or at least `A1` app-performance class if pricing is close
- endurance-oriented cards if the price premium is modest

What that means in practice:

- a good `64 GB` card from a major brand is better than a suspiciously cheap `128 GB` card
- for Phase 1, a normal good-quality card is fine
- if this Pi becomes a long-lived always-on server, an endurance-oriented card becomes more attractive

Simple buying rule:

- buy a reputable `64 GB` `A2` card if the price is reasonable
- otherwise buy a reputable `64 GB` `A1` card
- only pay extra for endurance if the gap is small

Belgium-friendly examples:

- `Reichelt Belgium`: `Raspberry Pi - MicroSD card, A2-Class, 64 GB` - `24.08 EUR`
- `Reichelt Belgium`: `SanDisk 64 GB microSDXC` `A2/U3/V30` - around `28.20 EUR` when in stock
- `MC Hobby`: generic `64 GB` microSD `Class 10 / UHS-I SDXC` - `17.67 EUR`

Practical recommendation:

- best balanced default: `Reichelt` `Raspberry Pi A2 64 GB`
- cheapest acceptable local option: `MC Hobby` `64 GB Class 10 / UHS-I`
- nicer branded option: `SanDisk A2 64 GB` if the premium is small and stock exists

## Optional Parts

### HDMI cable
Useful for first boot, diagnostics, or recovery, but not required for normal use.

### Small UPS or battery backup
Nice later, not required now.

### USB keyboard/mouse
Only for setup/debugging if you do not go headless from the start.

### External USB SSD enclosure
Useful if your chosen storage path uses SATA or USB rather than a more direct Pi 5 expansion path.

## Buying Tiers

## Tier 1 - Start Fast

Buy:

- `Raspberry Pi 5` 4 GB
- official `27W` PSU
- cooled case
- quality `64 GB microSD`

Expected total:

- about `90-135 EUR`

Best for:

- getting the server online quickly
- minimizing upfront spend
- accepting that storage may be upgraded later

## Tier 2 - Recommended Sweet Spot

Buy:

- `Raspberry Pi 5` 4 GB
- official `27W` PSU
- cooled case
- quality `64 GB microSD`

Expected total:

- about `90-135 EUR`

Best for:

- the best value default build
- fast setup with no extra storage hardware
- upgrading later only if the project earns it

## Tier 3 - Broader Reuse Build

Buy:

- `Raspberry Pi 5` 8 GB
- official `27W` PSU
- cooled case
- SSD-oriented storage path
- `128 GB` or `256 GB` SSD

Expected total:

- about `160-220 EUR`

Best for:

- this project plus other experiments
- extra headroom
- keeping one stronger SBC in your toolkit

## My Recommendation For You

Buy this unless local pricing is weird:

- `Raspberry Pi 5` 4 GB
- official `27W USB-C Power Supply`
- good cooled case
- high-quality `64 GB microSD`
- use Ethernet

Why this exact bundle:

- `64 GB` is already more than enough for your current server scope
- it is usually the best-value `microSD` capacity point
- it keeps the setup simple and cheap
- it still gives you a proper reusable `Pi 5` for other work

## If You Need To Cut Cost

Downgrade in this order:

1. start with `microSD` instead of SSD
2. keep `4 GB` instead of `8 GB`
3. keep the official PSU and active cooling anyway

Do not cheap out first on:

- power supply
- cooling
- networking assumptions

## If You Want To Future-Proof Slightly More

Upgrade in this order:

1. SSD-based storage
2. `8 GB` RAM only if you really expect broader use
3. small backup power later

## Bottom Line

The best `Pi 5` server setup for your project is not the absolute cheapest one.

It is:

- `Pi 5` 4 GB
- official PSU
- active cooling
- `64 GB microSD`
- Ethernet

That is the cleanest balance between cost, value, and reuse for Phase 1.
