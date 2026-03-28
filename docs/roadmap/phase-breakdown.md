# Plant Monitoring Phase Breakdown

## Phase 1 - Core Vertical Slice

### Goal
Prove the full end-to-end loop with one moisture node.

### Hardware
- one simple moisture node
- fixed device ID is acceptable
- use M5Stack for low-friction prototyping
- use the mini PC as the server

### Backend
- ingestion endpoint for moisture readings
- storage for raw values, normalized values, and derived status
- initial schema for `node`, `sensor`, `plant`, and `reading`
- calibration support per node or per sensor

### Frontend
- one plant card
- latest moisture
- last updated timestamp
- recent trend chart
- dry/okay/wet state

### Data Model
- `Node`
- `Sensor`
- `Plant`
- `Reading`
- calibration fields for moisture normalization

### Done Criteria
- data arrives reliably
- readings look believable
- dashboard updates correctly
- schema does not assume only one device exists

### Future-Proofing Notes
- moisture is the first capability, not the only one
- raw telemetry and interpretation must remain separate

## Phase 2 - Multi-Node Platform

### Goal
Support many nodes reporting to one server.

### Hardware
- duplicate the prototype node
- keep the node platform the same
- begin treating node identity as a real product concept

### Backend
- node registry
- multi-node ingestion
- pairing or provisioning mechanism
- plant assignment to node
- `lastSeenAt` tracking
- online/offline derivation
- per-node calibration

### Frontend
- multi-plant overview
- node health visibility
- stale/offline indicators
- assignment management UI if needed

### Data Model
- node identity fields
- plant-to-node relationship
- node status fields
- pairing token or provisioning model

### Done Criteria
- second node works without hacks
- fleet view is understandable
- the distinction between node, sensor, and plant is clear

### Future-Proofing Notes
- split telemetry layer from plant domain layer
- avoid tying plant identity to hardware identity

## Phase 3 - Plant Product Layer

### Goal
Make the product valuable as a plant-care app, not just a telemetry screen.

### Hardware
- no major new hardware required
- support plants with and without hardware

### Backend
- plant records with species, location, notes, and optional photos
- watering history
- optional repot and fertilize events
- target moisture band support
- alert generation rules

### Frontend
- fleet overview
- plant detail page
- node diagnostics page
- richer health/status language

### Data Model
- expanded `Plant`
- `CareEvent` or watering history model
- target ranges
- richer derived status model

### Done Criteria
- a plant can exist without a node
- manual tracking works
- plant detail and node diagnostics are separate views
- the app feels plant-centered

### Future-Proofing Notes
- keep plant records resilient to hardware replacement or offline state

## Phase 4 - Capability Expansion

### Goal
Add environmental metrics without redesigning the system.

### Hardware
- keep the same controller family
- add optional temperature, humidity, and light sensors
- reserve enclosure/device space for QR/NFC
- keep moisture-only as the core node variant

### Backend
- metric-agnostic readings
- capability declarations per node
- support additional sensor types
- capability-aware ingestion and validation

### Frontend
- widgets that appear only for supported metrics
- historical charts per metric
- capability-aware node detail pages

### Data Model
- `SensorType` expansion
- `NodeCapabilities`
- multi-metric readings or sensor-linked readings

### Done Criteria
- arbitrary metric types are handled cleanly
- nodes can have different sensor sets
- the software does not assume uniform hardware

### Future-Proofing Notes
- vary sensors by SKU, not by platform architecture
- test expanded nodes before making them standard

## Phase 5 - Physical Identity Layer

### Goal
Make scanning a normal part of the workflow.

### Hardware
- visible QR space on node or tag
- optional reserved NFC location for later
- clear external identity mark on each device

### Backend
- stable routes for plant and node identity
- scan-to-pair support
- scan-to-diagnose support
- identity mapping between physical marker and digital record

### Frontend
- scan-to-open plant page
- scan-to-open node page
- scan-based pairing and reassignment flows

### Data Model
- plant identity records
- node identity records
- mapping between QR/NFC payload and app record

### Done Criteria
- scan flows are faster than manual lookup
- node pairing and reassignment feel natural
- the physical-to-digital link is reliable

### Future-Proofing Notes
- start with QR first because it is simpler, cheaper, and easier to debug
- add NFC only after the QR flow is solid

## Phase 6 - Productization

### Goal
Turn the system into a repeatable kit.

### Hardware
- define server device shape
- define Basic and Plus node tiers
- establish packaging and label requirements
- keep nodes replaceable and reassignable

### Backend
- onboarding support
- firmware version reporting
- compatibility tracking
- export and backup support
- diagnostics APIs

### Frontend
- onboarding flow
- support and diagnostics views
- version visibility
- backup/export UI if needed

### Data Model
- firmware version metadata
- compatibility metadata
- product tier metadata
- onboarding and assignment state

### Done Criteria
- a user can set up the system without custom tinkering
- the product looks like a family rather than a one-off prototype
- supportability and replacement workflows are coherent

### Future-Proofing Notes
- keep provisioning, pairing, and plant assignment separate
- avoid early distractions such as auto-watering, cloud sync, or AI recommendations

## Cross-Phase Invariants

- `plant != node`
- `node != sensor`
- `raw telemetry != interpretation`
- `capabilities != assumptions`
- `pairing != identity`

## Recommended Prototype Stack

### Hardware
- mini PC for server
- M5Stack for nodes
- moisture-only first
- one experimental environment-enabled node later

### Product Shape
- one server per home
- one node per monitored plant
- optional tag-only path later
