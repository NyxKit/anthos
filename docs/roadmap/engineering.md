# Plant Monitoring Engineering Plan

## Objective

Turn the roadmap into an execution order that reduces risk early, validates architecture quickly, and avoids getting stuck on hardware polish before the product loop is proven.

## Execution Strategy

- prove one end-to-end path first
- duplicate the node early to test architecture assumptions
- keep the data model extensible before adding features
- use low-friction hardware for prototypes
- separate platform concerns from product concerns as soon as possible

## Milestone 1 - Single-Node Vertical Slice

### Scope
- one moisture node
- one server
- one ingestion API
- one database schema
- one tiny dashboard
- one calibration flow

### Engineering tasks
- define `node`, `sensor`, `plant`, and `reading` entities
- implement ingestion endpoint for moisture readings
- store raw reading, normalized value, and derived state separately
- support fixed device ID for the first node
- build minimal dashboard card with latest reading and trend
- add calibration fields per node

### Verification
- the node reports repeatedly without manual intervention
- readings persist correctly
- the dashboard reflects fresh data
- calibration changes only interpretation, not stored raw data

### Deliverable
- a working `1 node -> server -> storage -> dashboard` loop

## Milestone 2 - Architecture Test With Second Node

### Scope
- add a second node as soon as the first node works

### Engineering tasks
- duplicate the node setup
- confirm ingestion is node-aware
- add registry and per-node state
- verify dashboard supports multiple cards
- verify calibration remains independent per node

### Verification
- adding node two requires little or no schema change
- the server distinguishes nodes cleanly
- the UI remains understandable with multiple devices

### Deliverable
- proof that the system is a platform rather than a one-off demo

## Milestone 3 - Multi-Node Platform Foundation

### Scope
- formalize the fleet model

### Engineering tasks
- add node registry tables and APIs
- add plant-to-node assignment model
- add `lastSeenAt` and online/offline derivation
- introduce pairing or shared-token provisioning flow
- add node list and fleet overview UI

### Verification
- nodes can join and be identified cleanly
- offline behavior appears in the UI
- assignment and reassignment are supported in the model

### Deliverable
- first real multi-device platform foundation

## Milestone 4 - Plant Product Layer

### Scope
- make the app useful beyond telemetry

### Engineering tasks
- expand plant schema with species, location, notes, and photos
- add watering history records
- add target moisture bands
- add plant detail page
- add node detail and diagnostics page
- define richer status model such as dry, nearing dry, healthy, stale, sensor issue, offline

### Verification
- a plant can exist without a node
- node diagnostics do not clutter plant detail
- manual care history works independently from sensor reporting

### Deliverable
- product-grade dashboard behavior and domain model

## Milestone 5 - Capability-Aware Platform

### Scope
- prepare for more than moisture

### Engineering tasks
- add `sensorType` and capability declarations
- make readings metric-agnostic
- support temperature, humidity, and light in schemas and APIs
- create capability-aware widgets and charts
- test one experimental expanded node

### Verification
- the server accepts multiple metric types cleanly
- nodes with fewer sensors still work normally
- the UI only shows metrics that actually exist

### Deliverable
- extensible platform model for future SKUs

## Milestone 6 - Physical Identity Workflow

### Scope
- connect physical objects to records

### Engineering tasks
- generate QR identifiers for nodes and plants
- implement scan-to-open plant routes
- implement scan-to-pair and scan-to-diagnose node routes
- define stable route patterns for plant and node identity

### Verification
- a scan reliably reaches the correct record
- pairing through scan is faster than manual lookup
- reassignment flow remains clean

### Deliverable
- physical-to-digital interaction layer

## Milestone 7 - Productization Foundation

### Scope
- make the system repeatable

### Engineering tasks
- define onboarding flow
- add firmware version reporting
- add compatibility versioning if needed
- add diagnostics/support views
- add export and backup support
- define Basic and Plus node variants
- document packaging and labeling requirements

### Verification
- a fresh setup can be completed without dev-only knowledge
- hardware replacement does not break records
- support information is visible in the UI

### Deliverable
- product-ready foundation rather than a prototype pile

## Suggested Codebase Slices

### Backend
- ingestion
- nodes
- plants
- readings
- metrics
- pairing
- alerts
- tags

### Frontend
- overview dashboard
- plant detail
- node detail
- pairing flow
- calibration settings
- history and charts

### Shared contracts
- node
- plant
- sensor
- reading
- capability
- alert

## Data Model Priorities

### Must be correct from day one
- plant and node are separate entities
- node and sensor are separate entities
- readings store raw and interpreted values separately
- calibration belongs per node or per sensor, not globally

### Must be extensible before Phase 4
- capability declaration per node
- metric type per sensor or reading
- assignment history if node swaps become common

## Hardware Plan

### Recommended now
- server on existing mini PC
- nodes on M5Stack platform
- moisture-only first
- one experimental environment-capable node later

### Explicitly avoid for now
- Raspberry Pi per plant node
- custom PCB thinking too early
- auto-watering hardware
- enclosure perfection before telemetry reliability

## Quality Gates

- second node works without uncomfortable refactoring
- stale/offline state is visible and reliable
- calibration is testable and understandable
- plant records remain intact when hardware changes
- metric expansion does not require a schema rewrite

## Immediate Next Build Order

1. Build Milestone 1.
2. Duplicate the node immediately for Milestone 2.
3. Formalize registry, assignment, and offline state.
4. Add richer plant records and diagnostics views.
5. Add capability-aware metrics.
6. Add QR flows.
7. Productize onboarding and support features.
