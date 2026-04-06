# Feature Specification: Generic Node Provisioning

**Feature Branch**: `002-generic-node-provisioning`  
**Created**: 2026-04-06  
**Status**: Draft  
**Input**: User description: "Generic node provisioning via BLE, automatic WiFi join, and hub-assigned node identity"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Flash Once, Deploy Many (Priority: P1)

A user flashes the generic firmware to a new node. The same binary works for every node — no per-device configuration, no manual ID, no hardcoded credentials. The device boots and enters provisioning mode automatically.

**Why this priority**: This is the foundation. Without a truly generic firmware, every other provisioning story is blocked. It also eliminates the most friction-heavy step in the current workflow.

**Independent Test**: Flash the same firmware binary to two separate devices. Both should boot, advertise over BLE, and be provisionable as distinct nodes without any code changes or configuration between them.

**Acceptance Scenarios**:

1. **Given** a freshly flashed node with no stored configuration, **When** the device boots for the first time, **Then** it enters BLE provisioning mode and begins advertising a discoverable BLE service
2. **Given** two nodes flashed with the same firmware binary, **When** both are provisioned separately, **Then** the hub assigns them different logical identities derived from their unique hardware IDs
3. **Given** a node in provisioning mode, **When** no provisioning is completed within a configurable timeout, **Then** the node falls back to a captive portal access point as an alternative provisioning method

---

### User Story 2 - BLE-Assisted WiFi Provisioning via App (Priority: P1)

A user opens the Anthos mobile app, taps "Add Node", and the app discovers nearby unprovisioned nodes over BLE. They select a node, confirm their home WiFi credentials (pre-filled from last time), and the app sends the credentials to the node. The node joins the home network automatically.

**Why this priority**: Replaces the most painful manual step — entering WiFi credentials per device. This is the primary provisioning path for all users with a phone.

**Independent Test**: Starting from a freshly flashed node in BLE advertising mode, use the app to transmit WiFi credentials and confirm the node joins the network — without touching any config files or serial monitors.

**Acceptance Scenarios**:

1. **Given** the app is open and a node is in BLE provisioning mode nearby, **When** the user taps "Add Node", **Then** the app discovers and lists the unprovisioned node within 10 seconds
2. **Given** the user has selected a node and entered WiFi credentials, **When** they confirm, **Then** the node connects to the specified WiFi network within 30 seconds
3. **Given** the user provides incorrect WiFi credentials, **When** the node fails to connect, **Then** the app receives an error status from the node and prompts the user to retry with corrected credentials
4. **Given** the node successfully joins the network, **When** provisioning completes, **Then** the app transitions to the hub registration step automatically

---

### User Story 3 - Automatic Hub Registration and ID Assignment (Priority: P1)

Once a node joins WiFi, it automatically discovers the Anthos hub on the local network and registers itself. The hub assigns a logical ID and the node stores it persistently. From this point on the node operates fully autonomously, sending telemetry using its assigned identity.

**Why this priority**: This closes the provisioning loop. Without automatic hub registration, the user would still need to manually configure IDs.

**Independent Test**: After WiFi provisioning, confirm the node appears in the hub's node registry with an assigned ID and begins delivering telemetry — without any manual step on the hub or the node.

**Acceptance Scenarios**:

1. **Given** a node that has just joined the WiFi network, **When** it discovers the hub via mDNS, **Then** it sends a registration request containing its hardware ID and firmware version
2. **Given** a hub that receives a registration request from a new hardware ID, **When** no prior record exists, **Then** it assigns a new logical node ID and returns it in the response
3. **Given** a hub that receives a registration request from a known hardware ID (e.g., after factory reset), **When** a prior record exists, **Then** it returns the same previously assigned logical node ID
4. **Given** a node that has completed registration, **When** it stores its logical ID persistently and reboots, **Then** it uses the stored ID on subsequent boots without re-registering
5. **Given** the hub is temporarily unavailable when the node first tries to register, **When** the hub comes back online, **Then** the node retries registration automatically and eventually succeeds

---

### User Story 4 - Factory Reset and Re-Provisioning (Priority: P2)

A user wants to move a node to a different network or reassign it. They perform a factory reset by holding the button for 3 seconds. The node clears all stored configuration, re-enters BLE provisioning mode, and can be provisioned fresh.

**Why this priority**: Essential for recovery and reassignment workflows. Without this, a misconfigured or relocated node becomes permanently broken.

**Independent Test**: Perform a factory reset on a provisioned node. Confirm it re-enters BLE advertising mode, loses all stored credentials and ID, and can be fully re-provisioned as if new.

**Acceptance Scenarios**:

1. **Given** a provisioned node, **When** the user holds the physical button for 3 seconds, **Then** the node clears its stored WiFi credentials and logical ID from persistent storage and restarts into BLE provisioning mode
2. **Given** a factory-reset node that is re-provisioned with the same hub, **When** it registers using its hardware ID, **Then** the hub re-links it to the same logical ID (preserving history)
3. **Given** a factory-reset node that is re-provisioned with a different hub, **When** it registers, **Then** the new hub treats it as a new node and assigns a fresh logical ID

---

### Edge Cases

- Multiple unprovisioned nodes in BLE range simultaneously are shown as a list in the app, each identified by their BLE advertisement name (e.g., "Anthos-A3F2"); the user selects the intended device manually.
- If the hub cannot be found via mDNS after WiFi provisioning, the app surfaces a "hub not found" warning after a timeout and offers a manual IP/hostname entry field as a fallback; the node continues retrying in the background using whatever address is provided.
- What happens if the node's persistent storage becomes corrupted — does it enter provisioning mode or fail silently?
- What happens if the node firmware version is incompatible with the hub's expected registration protocol?
- How does the system handle a node that loses WiFi connection after registration and later reconnects?

## Clarifications

### Session 2026-04-06

- Q: Should the hub require any form of authorization before accepting a node registration? → A: Pairing window — user opens a time-limited registration window on the hub before adding a node
- Q: How should the app present multiple discoverable unprovisioned nodes to the user? → A: Show a list identified by short hardware-ID suffix; user selects the target device
- Q: What should happen on the app/user side if hub registration doesn't complete after WiFi provisioning succeeds? → A: App shows a "hub not found" warning after a timeout, with an optional field to enter the hub's IP address manually
- Q: What state should a newly registered, unnamed node appear as in the hub dashboard? → A: Visible in a dedicated "Unclaimed Nodes" section with a prompt to name or assign it
- Q: When should the BLE provisioning session close? → A: After the node reports the WiFi connection result (success or failure) back to the app

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The firmware MUST be identical for all nodes — no per-device configuration at flash time
- **FR-002**: The node MUST derive its hardware identity from the device's built-in unique hardware identifier, not set manually
- **FR-003**: On first boot with no stored credentials, the node MUST enter BLE provisioning mode and advertise a discoverable BLE service
- **FR-004**: The node MUST expose a BLE characteristic that accepts WiFi credentials (SSID and password) from the mobile app
- **FR-005**: The node MUST expose a BLE characteristic that reports provisioning status (connecting, success, failure) back to the app in real time
- **FR-006**: After receiving WiFi credentials, the node MUST attempt to connect to the specified network and report the result (success or failure) over BLE, then close the BLE session
- **FR-007**: After joining WiFi, the node MUST attempt to discover the hub using mDNS as the primary discovery method
- **FR-008**: The node MUST send a registration payload to the hub containing its hardware ID and firmware version
- **FR-009**: The hub MUST only accept registration requests while a pairing window is active; registration attempts outside an open window MUST be rejected
- **FR-010**: The hub MUST provide a way for the user to open a time-limited pairing window (default: 5 minutes) via the app or dashboard before adding a new node
- **FR-011**: The hub MUST assign a logical node ID upon receiving a valid registration request from an unknown hardware ID during an open pairing window
- **FR-012**: The hub MUST return the same logical node ID for repeated registrations from the same hardware ID (re-registration after factory reset does not require an open pairing window)
- **FR-013**: The node MUST persist its assigned logical node ID in non-volatile storage and use it for all subsequent telemetry
- **FR-014**: The node MUST skip BLE provisioning mode on subsequent boots if valid credentials and a logical ID are already stored
- **FR-015**: Holding the physical button for 3 seconds MUST trigger a factory reset — clearing all stored credentials and ID and restarting into BLE provisioning mode
- **FR-016**: If hub discovery via mDNS fails, the node MUST retry at regular intervals rather than giving up permanently
- **FR-017**: The mobile app MUST scan for and list all nearby unprovisioned BLE nodes when the user initiates "Add Node", each displayed with a short identifier derived from its hardware ID (e.g., last 4 characters)
- **FR-018**: The mobile app MUST transmit WiFi credentials to the selected node and display provisioning progress to the user
- **FR-019**: The mobile app MUST provide a way to open the hub's pairing window before or during the "Add Node" flow
- **FR-020**: If hub registration does not complete within a defined timeout after WiFi provisioning succeeds, the app MUST display a "hub not found" warning and offer a manual IP/hostname entry field so the user can re-point the app at the hub directly
- **FR-021**: The node MUST store a hub URL persistently when one is provided in the BLE credentials payload at provisioning time, and use it as the primary hub URL on all subsequent boots; if no URL was provided via BLE, the node falls back to mDNS discovery and persists the resolved address after first successful contact
- **FR-022**: The hub dashboard MUST display newly registered, unnamed nodes in a dedicated "Unclaimed Nodes" section separate from the main node list
- **FR-023**: The hub dashboard MUST provide a prompt or action within the "Unclaimed Nodes" section allowing the user to assign a name and optionally link the node to a plant

### Key Entities

- **Hardware Node**: Immutable device identity anchored to the physical chip's unique ID. Attributes: hardware ID, first seen timestamp, last seen timestamp, firmware version.
- **Logical Node**: User-facing node identity assigned by the hub. Attributes: logical node ID, linked hardware ID, display name (optional, empty until user assigns one), claim status (unclaimed / claimed), registration timestamp.
- **Provisioning Session**: Transient state during BLE-assisted setup. Tracks: node hardware ID, provisioning status, WiFi join result, hub registration result.
- **BLE Provisioning Service**: The BLE GATT service exposed by an unprovisioned node. Exposes characteristics for receiving credentials and reporting WiFi connection status. Session closes automatically after the WiFi result is reported; hub registration proceeds over WiFi independently.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add a new node from unboxing to active telemetry in under 5 minutes
- **SC-002**: The same firmware binary, without modification, successfully provisions on at least two different physical nodes in the same session
- **SC-003**: 100% of nodes that complete WiFi provisioning and can reach the hub are assigned a unique logical ID without manual intervention
- **SC-004**: A node that has been factory-reset and re-provisioned to the same hub resumes its original logical ID and telemetry history within 60 seconds of reset completion
- **SC-005**: The app discovers a nearby unprovisioned node within 10 seconds of initiating "Add Node"
- **SC-006**: Provisioning failures (wrong WiFi password, hub unreachable) surface actionable feedback to the user within 30 seconds of the failure

## Assumptions

- The target hardware (M5Stack AtomS3 Lite / ESP32-S3) exposes a stable unique hardware identifier accessible at boot without external configuration
- mDNS is functional on the target home network; known problematic routers are an accepted edge case, not a blocking constraint for this feature
- The mobile app is built with Tauri targeting Android and iOS, sharing the Vue 3 frontend codebase with the hub dashboard
- iOS BLE access is available through Tauri's native plugin layer, resolving the Safari Web Bluetooth limitation
- The hub is already running and reachable on the local network when provisioning is performed
- A single physical button on the node hardware is available and readable in firmware for factory reset triggering
- The hub's node registry schema will be extended to support the two-layer identity model (hardware ID → logical ID) as part of this feature

## Dependencies

- Hub server must expose a `/register` endpoint accepting hardware ID and firmware version, returning a logical node ID
- Hub server must broadcast itself via mDNS as `anthos.local` on the local network
- Mobile app (Tauri) requires a BLE plugin capable of scanning, connecting, and performing GATT characteristic reads/writes on both iOS and Android
- Node firmware build environment must support BLE and WiFi libraries for the ESP32-S3 platform
