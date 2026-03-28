# Plant Monitoring Product Spec

## Product Summary

Build a modular plant monitoring product made of one central server device and many optional per-plant monitoring nodes. The first version focuses on soil moisture, but the platform is designed to expand into temperature, humidity, light, QR/NFC identity, and richer plant-care workflows without redesigning the whole system.

## Product Vision

Create a product that helps people care for plants through reliable sensing, clear plant records, and a pleasant physical-to-digital workflow.

The long-term product should feel like:
- one home server per household
- one simple node per monitored plant
- one dashboard that combines live telemetry, care history, and device management
- one coherent platform that can grow from hobby prototype to sellable kit

## Product Shape

### Server Device
The server is bought once and acts as the home hub.

Responsibilities:
- receive data from plant nodes
- store readings and metadata
- expose dashboard and API
- handle pairing and provisioning
- support diagnostics, export, and version tracking

Early recommendation:
- use the existing mini PC first
- treat Raspberry Pi or a dedicated hub as a later packaging decision

### Plant Node
The node is bought per plant and is the core hardware primitive.

Responsibilities:
- measure moisture first
- later support temperature, humidity, and light where relevant
- send telemetry to the server
- expose a hardware identity
- support QR now and possibly NFC later

Early recommendation:
- prototype with M5Stack to reduce hardware friction
- keep the controller family consistent across node variants

### Dashboard / App
The dashboard is the actual user-facing product.

Responsibilities:
- show current values and trend history
- manage plant records
- show alerts and stale/offline states
- support care history and notes
- support node pairing, assignment, and diagnostics

## Target Users

### Primary users
- plant hobbyists who want clearer watering insight
- people with multiple plants who struggle with consistency
- technically curious users who enjoy a product that feels a little more deliberate than a generic reminder app

### Secondary users
- people who want plant tracking without hardware at first
- users who may start with tags only and add nodes later

## Problem Statement

Plant owners often guess at watering, misread light, and lose track of care history. Existing solutions are often either too manual, too gadgety, or too automation-heavy too early. The opportunity is to build a product that starts with a reliable moisture signal and grows into a broader plant-care platform.

## Core Product Principles

- moisture is the first capability, not the entire product
- plant identity is separate from hardware identity
- a plant should exist in the app with or without a node
- nodes may have different capabilities
- raw telemetry should be stored separately from derived interpretation
- QR should come before NFC
- reliable and simple beats polished but fragile

## MVP Definition

The first meaningful product milestone should include:
- one local server device
- multiple moisture nodes
- one plant assignment per node
- per-node calibration
- dashboard with latest moisture, trend chart, and online/offline state
- plant detail page
- QR code on node or plant tag

Explicitly not required for MVP:
- NFC
- auto-watering
- cloud sync
- native mobile app
- AI recommendations
- advanced automation rules

## Product Roadmap

## Phase 1 - Core Vertical Slice

### Goal
Prove the full product loop from one node to one dashboard.

### Outcome
- one moisture node sends data to the server
- the server stores readings
- the dashboard shows latest value and trend
- calibration exists from the start

### Why it matters
This phase proves the platform architecture, not just a sensor experiment.

## Phase 2 - Multi-Node Platform

### Goal
Turn the prototype into a true one-to-many system.

### Outcome
- many nodes can report to one server
- nodes have identity, status, and assignment
- the dashboard supports fleet views

### Why it matters
This is the first point where the product begins to resemble something sellable.

## Phase 3 - Plant Product Layer

### Goal
Make the product useful even beyond hardware telemetry.

### Outcome
- richer plant records
- care history and notes
- alerts and target ranges
- plant detail and node diagnostics views

### Why it matters
This is where the product becomes a plant-care system instead of a sensor screen.

## Phase 4 - Capability Expansion

### Goal
Add more metrics without breaking the platform model.

### Outcome
- support for ambient metrics like temperature, humidity, and light
- capability-aware nodes
- hardware design reserves space for QR/NFC and future revisions

### Why it matters
This phase creates product tiers and a path to a broader hardware family.

## Phase 5 - Physical Identity Layer

### Goal
Make physical interaction part of the experience.

### Outcome
- scan a plant to open its record
- scan a node to pair or diagnose it
- establish a strong QR-first workflow

### Why it matters
This bridges the physical product and digital product in a way users actually feel.

## Phase 6 - Productization

### Goal
Make the system repeatable, supportable, and packageable.

### Outcome
- onboarding and provisioning flow
- product tiers
- diagnostics, export, and version tracking
- packaging and naming consistency

### Why it matters
This is the difference between a good prototype and a real product family.

## Proposed Product Tiers

### Server
- one server device per home
- mini PC first, dedicated hub later if justified

### Node Basic
- moisture only
- lowest-cost monitored entry point

### Node Plus
- moisture plus environmental sensing
- same platform family, expanded sensor payload

### Tag-Only Kit
- QR or NFC plant tags without telemetry hardware
- lower-cost entry point for plant record management

## User Experience Pillars

- setup should be simple enough for non-hardware people
- plant state should be understandable at a glance
- diagnostics should exist without leaking engineering complexity into normal plant views
- physical scanning should feel natural, not novelty-driven
- the product should stay useful even if a node is offline or absent

## Technical Boundaries That Protect The Product

- `plant != node`
- `node != sensor`
- `pairing != assignment`
- `raw telemetry != interpretation`
- `capabilities != assumptions`

## Main Risks

- overfitting the whole system to moisture only
- treating one-node behavior as if it scales automatically
- mixing plant UX and hardware diagnostics together
- over-investing in hardware polish before reliability is proven
- going NFC-first instead of QR-first
- adding care intelligence before enough good data exists

## Recommended Near-Term Decisions

- use the mini PC as the first server
- use M5Stack as the first node platform
- make moisture the first SKU
- build QR-first identity workflows
- test environment sensing on an experimental node before making it standard

## Success Criteria For The Overall Product Direction

- the first two nodes feel like the same product, not two custom hacks
- the app remains useful even without full hardware rollout
- product tiers can be added without changing the core server model
- replacing or reassigning hardware does not break plant history
- the platform can grow without rethinking its core concepts
