# Plant Monitoring Product Roadmap

- Phase 1: Build the core vertical slice with one moisture node, one server, storage, calibration, and a tiny dashboard.
- Phase 2: Expand to a multi-node system with pairing, node registry, per-node calibration, and fleet visibility.
- Phase 3: Turn the monitor into a plant-care product with plant profiles, care history, alerts, and richer UX.
- Phase 4: Expand node capabilities beyond moisture with temperature, humidity, light, and a metric-agnostic platform model.
- Phase 5: Add a physical identity layer with QR first and NFC later for scan-to-open and scan-to-pair workflows.
- Phase 6: Productize the system into a sellable kit with onboarding, diagnostics, versioning, packaging, and product tiers.

## Phase 1 - Core Vertical Slice

### Goal
Prove the end-to-end platform loop: `1 node -> server -> storage -> dashboard`.

### Build
- One plant node using a moisture sensor only.
- One server device, ideally your existing mini PC for the first version.
- A lightweight ingestion API.
- A database that stores readings and supports future expansion.
- A tiny dashboard with latest moisture, last updated time, trend chart, and a simple dry/okay/wet state.
- Per-node calibration support from day one.

### Key decisions
- Treat moisture as the first capability, not the whole product.
- Store raw readings separately from normalized values and derived status.
- Model `node`, `sensor`, `plant`, and `reading` separately even if there is only one of each.
- Use a fixed device ID initially if it helps move faster.
- Prefer reliable, simple hardware over polished hardware at this stage.

### Done when
- Sensor data arrives reliably.
- Values look believable after calibration.
- The dashboard updates correctly.
- The schema does not assume there will only ever be one device.

## Phase 2 - Multi-Node Platform

### Goal
Support many plant nodes reporting to one server without hacks.

### Build
- Unique node identity and naming.
- Pairing or provisioning flow.
- Node registry on the server.
- Multi-node ingestion.
- Plant assignment to nodes.
- `last seen` tracking and online/offline state.
- Per-node calibration.
- Multi-plant overview dashboard.

### Key decisions
- Split telemetry concerns from plant-care concerns.
- Telemetry should cover devices, readings, connectivity, and timestamps.
- Plant domain should cover species, location, care profile, and thresholds.
- Do not make plant identity equal to hardware identity.

### Done when
- Adding a second node feels natural.
- The dashboard works as a fleet view.
- The system clearly distinguishes node, sensor, and plant.

## Phase 3 - Plant Product Layer

### Goal
Turn the monitor into a real plant-care product instead of a raw sensor viewer.

### Build
- Plant records with name, species, location, notes, and optional photos.
- Watering history.
- Optional repot and fertilize dates.
- Target moisture bands and alerts.
- Plant detail page.
- Node detail and diagnostics page.
- Status states such as dry, nearing dry, healthy, recently watered, stale data, sensor issue, and offline node.

### Key decisions
- A plant must exist independently from hardware.
- Users should be able to track a plant manually even without a node.
- Hardware diagnostics and plant UX should be separate views.
- The app should stay useful even before users buy more hardware.

### Done when
- The app is useful beyond live telemetry.
- A plant can be managed with or without an attached node.
- The product feels plant-centered rather than sensor-centered.

## Phase 4 - Capability Expansion

### Goal
Expand the node platform beyond moisture while keeping hardware and software extensible.

### Build
- Support for temperature, ambient humidity, and light intensity.
- A metric-agnostic reading model.
- Node capability declarations so each node advertises what it can measure.
- Dashboard widgets and charts that appear only for supported metrics.
- A revised enclosure/device design with visible identity space and room for future expansion.

### Key decisions
- Capabilities must be explicit; never assume all nodes have all sensors.
- Keep the controller platform consistent and vary the sensor payload by SKU.
- Design around simple, modular node hardware.
- For prototyping, use M5Stack nodes and your mini PC as the server.
- Keep moisture-only as the core SKU and test environment sensing on a smaller subset first.

### Done when
- The server handles arbitrary metric types.
- Different nodes can support different sensor sets cleanly.
- The hardware has a clear path for QR/NFC placement and future revisions.

## Phase 5 - Physical Identity Layer

### Goal
Connect physical plants and physical devices cleanly to digital records.

### Build
- QR codes for plant identity and node identity.
- Scan-to-open plant detail flow.
- Scan-to-pair or scan-to-diagnose node flow.
- Stable URLs such as `/plants/:plantId` and `/nodes/:nodeId`.
- Optional NFC later for a more premium interaction.

### Key decisions
- Distinguish plant identity from node identity.
- Start with QR because it is cheaper, simpler, visible, and easier to debug.
- Add NFC only after the QR workflow is strong.
- Treat physical identity as part of core UX, not as a gimmick.

### Done when
- Scanning a pot or device feels like a natural workflow.
- Pairing and reassignment are easier than manual lookup.
- The physical-to-digital link is obvious and reliable.

## Phase 6 - Productization

### Goal
Turn the prototype into a repeatable, sellable kit.

### Build
- A defined server product, likely mini PC first and dedicated hub later if needed.
- Clear node tiers such as Basic (`moisture`) and Plus (`moisture + environment`).
- Onboarding and provisioning flow.
- Firmware version reporting and compatibility tracking.
- Diagnostics and support views.
- Backup/export support.
- Replaceable and reassignable nodes.
- Packaging, naming, printed labels, and basic documentation.

### Key decisions
- Sell one server device per home and multiple per-plant nodes.
- Keep pairing, provisioning, and plant assignment as separate concepts.
- Product tiers should differ by capabilities, not by platform architecture.
- Avoid early distractions like auto-watering, cloud sync, mobile apps, and AI recommendations.

### Done when
- A new user can set up the server and add a node without custom tinkering.
- The system looks like a product family rather than a maker project.
- Hardware replacement, firmware tracking, and onboarding all have a coherent story.

## MVP Definition

- One local server device.
- Multiple moisture nodes.
- Each node paired to one plant.
- Dashboard with latest moisture, trend chart, plant name, and online/offline state.
- QR code on each node or plant tag.
- Simple plant detail page.
- Calibration per node.

## Product Boundaries To Keep From Day One

- `plant != node`
- `node != sensor`
- `raw telemetry != interpretation`
- `capabilities != assumptions`
- `pairing != identity`

## Recommended Immediate Next Steps

- Build Phase 1 with one moisture node, one server, and calibration support.
- Duplicate the node as early as possible to force the Phase 2 architecture test.
- Use M5Stack for early node prototypes to reduce hardware friction.
- Keep the mini PC as the first server device before considering a dedicated hub.
