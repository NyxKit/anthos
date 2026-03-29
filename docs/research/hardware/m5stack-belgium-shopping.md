# M5Stack Shopping Guide For Belgium

## Goal

Turn the M5Stack hardware recommendation into a concrete shopping guide using shops that are realistic for Belgium and avoid expensive US-first ordering paths.

## Best Shop Strategy

For Belgium, I would use this order of preference:

1. `MC Hobby` for local/Belgium convenience when the exact item is in stock
2. `Reichelt Belgium` for a strong EU option with explicit Belgium delivery, visible VAT pricing, and low-ish shipping
3. `TinyTronics` in the Netherlands for nearby EU shipping and solid M5Stack coverage
4. `BerryBase` in Germany as a fallback when you need a broader M5Stack catalog

Why I am prioritizing these:

- they are in Belgium or nearby EU countries
- they avoid US shipping and import hassle
- M5Stack itself lists several of them as European distributors
- `Reichelt` explicitly shows Belgium shipping and `shipping costs from 6.95 EUR`

## Shops Worth Using

## 1. MC Hobby

URL:

- `https://shop.mchobby.be`

Why it is relevant:

- Belgium-based
- M5Stack is listed by M5Stack on its distributor page under Belgium
- local returns/support are easier
- likely the best option when stock matches your basket

What I found:

- the shop explicitly says it delivers quickly in Belgium, France, Luxembourg, and other European countries on request
- quick spot-checking suggests the M5Stack selection may be thinner than larger EU distributors

Recommendation:

- check this first because it is local
- if the exact parts are missing, switch to `Reichelt`

## 2. Reichelt Belgium

URL:

- `https://www.reichelt.com/be/en/shop/search/M5Stack`

Why it is strong:

- Belgium storefront and pricing
- explicit Belgium shipping flow
- shipping shown from `6.95 EUR`
- good coverage of M5Stack Atom and Unit parts

What I confirmed:

- `AtomS3 Lite ESP32S3 development kit` at `11.08 EUR`
- `ENVIII unit, temperature, humidity and air pressure sensor` at `7.11 EUR`
- site shows Belgium delivery and `3 - 4 business days` on in-stock items

Recommendation:

- this is the most concrete and reliable webshop choice for your first basket right now

## 3. TinyTronics

URL:

- `https://www.tinytronics.nl/nl/platformen-en-systemen/m5stack`

Why it is strong:

- Netherlands-based, so shipping to Belgium should be geographically sensible
- broad M5Stack catalog
- prices are visible and generally reasonable

What I confirmed:

- `M5Stack Atom S3 Lite - ESP32-S3 Development Board` at `10.75 EUR`
- `M5Stack` category includes Atom-family boards and Grove-compatible accessories

Recommendation:

- use this as the best nearby fallback if `Reichelt` is missing a part or if a combined basket works out cheaper

## 4. BerryBase

URL:

- `https://www.berrybase.de/en/development-boards/m5stack/`

Why it is relevant:

- Germany-based
- broad M5Stack categories, including `M5Stack Units`
- useful fallback for harder-to-find parts

What I confirmed:

- broad `M5Stack`, `Atom`, and `M5Stack Units` category coverage

Recommendation:

- use as fallback rather than first stop, unless you already plan a larger mixed-component order from Germany

## Concrete Recommended Parts

These are the M5Stack-side parts I would actually buy for your roadmap.

## Core Node Controller

### `M5Stack AtomS3 Lite`

Why this one:

- ESP32-S3 platform
- small enough for per-plant nodes
- better long-term default than older `Atom Lite`
- matches the earlier hardware recommendation

Concrete examples:

- `Reichelt`: `AtomS3 Lite ESP32S3 development kit` - `11.08 EUR`
- `TinyTronics`: `M5Stack Atom S3 Lite - ESP32-S3 Development Board` - `10.75 EUR`

Buy quantity:

- buy `2` immediately

Why:

- one node is a demo
- two nodes test the real architecture

## Ambient Sensor Expansion

### `M5Stack Unit ENV-III`

Why this one:

- temperature, humidity, and pressure in one unit
- clean Phase 4 expansion path
- useful on one experimental node first

Concrete example:

- `Reichelt`: `ENVIII unit, temperature, humidity and air pressure sensor` - `7.11 EUR`

Buy quantity:

- buy `2`

Why:

- low enough unit cost that avoiding a second shipping round is sensible
- keeps both nodes physically symmetrical if you want that

## Lux Sensor

### `M5Stack DLight (BH1750FVI-TR, Grove, I2C)`

Why this one:

- proper lux sensor rather than just a simple light/dark detector
- better fit for plant-light tracking
- Grove/I2C integration
- cheap enough to buy two up front

Concrete example:

- `MC Hobby`: `M5Stack: Capteur luminosite ambiante (BH1750FVI-TR), Grove, I2C` - `7.80 EUR`

Buy quantity:

- buy `2`

Why:

- the extra cost is small compared with paying shipping again later
- lets both nodes carry the same full sensor set if you want

## Optional Physical Packaging / Atom Expansion

### `Atomic` / Atom-oriented enclosure-expansion path

Why it matters:

- useful if you want the Atom node to feel less bare and more product-like
- gives a cleaner path for mounting and enclosure experiments

Reality check:

- local stock seems less consistent than the core controller boards
- MC Hobby search surfaced `Atomic` prototyping stock, but not a rich AtomS3 Lite basket from the quick spot check

Recommendation:

- do not block Phase 1 on this
- use a simple printed or off-the-shelf enclosure first

## Optional ADC Bridge

### `M5Stack Unit ADC`

Why it matters:

- useful if your analog moisture probe readings are noisy or unstable

What I found:

- it was not easy to confirm in-stock availability in the most Belgium-friendly M5Stack shop checks

Recommendation:

- do not make this part of the default first order
- first test your chosen moisture probe directly
- add ADC only if real readings justify it

## Recommended First Basket

If you want the cleanest first order, I would make this basket:

- `2x M5Stack AtomS3 Lite`
- `2x M5Stack Unit ENV-III`
- `2x M5Stack DLight (BH1750)`
- required Grove/HY2.0 cables if not included with the selected unit

Best current shop for that basket:

- `Reichelt Belgium`

Why:

- I confirmed `AtomS3 Lite` and `ENVIII` at `Reichelt`, and `DLight` at `MC Hobby`
- shipping info is explicit for Belgium
- the pricing is solid

Rough subtotal from the confirmed items:

- `2 x 11.08 EUR = 22.16 EUR`
- `2 x 7.11 EUR = 14.22 EUR`
- `2 x 7.80 EUR = 15.60 EUR`
- subtotal before cables/shipping: `51.98 EUR`
- plus shipping from `6.95 EUR` if all ordered from one compatible source mix is not possible, or more if split across shops

That makes the core M5Stack part of the first prototype surprisingly affordable.

## Alternative First Basket

If you prefer a Netherlands shop close to Belgium:

- `TinyTronics` for the `AtomS3 Lite`
- use `Reichelt` or another EU distributor if `ENVIII` is missing or backordered

This may or may not be cheaper once split-shipping is considered, so I would prefer one-shop ordering if possible.

## What I Would Not Order Yet

- extra environmental modules for every node
- battery accessories for all nodes
- NFC accessories
- niche M5Stack add-ons that are not directly needed for Phase 1
- ADC unless the moisture probe proves it is necessary

## My Recommendation

For Belgium, I would do this now:

1. try to place the first basket at `Reichelt Belgium`
2. check `MC Hobby` only if you want to favor the local Belgian seller and the exact parts are in stock
3. use `TinyTronics` as the nearby fallback for Atom-family parts

## Sources

- M5Stack official distributor page
- `Reichelt Belgium` M5Stack search and product pages
- `TinyTronics` M5Stack category and AtomS3 Lite listing
- `MC Hobby` site and M5Stack section
- `BerryBase` M5Stack category pages
