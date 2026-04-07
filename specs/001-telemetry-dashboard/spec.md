# Feature Specification: Telemetry Dashboard

**Feature Branch**: `001-telemetry-dashboard`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Create a simple dashboard using Vue+SCSS with nyx-kit component library, Vue router, and Pinia. Apply the same frontend setup as nyx-notes. Write the stack to architecture.md. As a prototype, show the single node and all different unit values being received."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Node Telemetry (Priority: P1)

As a user, I want to view the dashboard and see real-time telemetry data from my single node so that I can monitor sensor readings at a glance.

**Why this priority**: This is the core value of the dashboard - users need to see sensor data to verify their node is working correctly.

**Independent Test**: Can be tested by loading the dashboard and verifying all connected sensor values display with their current readings.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** the user views the page, **Then** they see a single node card displaying the node identifier
2. **Given** sensor data is being pushed to the server, **When** the user views the dashboard, **Then** all unit values (e.g., lux, temperature, humidity, soil moisture) are displayed with their current values
3. **Given** new sensor readings arrive, **When** they arrive at the server, **Then** the dashboard updates to show the new values within 2 seconds

---

### User Story 2 - View Unit Details (Priority: P2)

As a user, I want to see each sensor unit clearly labeled with its value and unit of measurement so that I understand what each reading represents.

**Why this priority**: Users need to understand what each value means without confusion.

**Independent Test**: Can be tested by checking that each displayed sensor has both a value and a unit label.

**Acceptance Scenarios**:

1. **Given** multiple sensors are reporting, **When** they are displayed, **Then** each sensor shows its name, current value, and unit (e.g., "Temperature: 23.5°C")
2. **Given** a sensor reports a new value, **When** the value changes, **Then** the display updates to show the new value while preserving the unit label

---

### User Story 3 - View Node Health (Priority: P3)

As a user, I want to see the connection status of my node so that I know whether data is being received reliably.

**Why this priority**: Users need confidence that their node is connected and data is flowing.

**Independent Test**: Can be tested by checking the node's connection status indicator on the dashboard.

**Acceptance Scenarios**:

1. **Given** the node is connected and pushing data, **When** the dashboard loads, **Then** the node shows as "connected"
2. **Given** the node disconnects, **When** no data is received for 30 seconds, **Then** the node status changes to indicate disconnection

---

### Edge Cases

- What happens when no sensor data has been received yet? Show empty state with "Waiting for data..." message.
- What happens when a sensor value is invalid or missing? Display "N/A" or "-" for that specific sensor.
- What happens when the API is unreachable? Show error state with retry option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST display a single node card showing the node identifier
- **FR-002**: The dashboard MUST fetch and display all sensor unit values received from the node
- **FR-003**: Each sensor value MUST be displayed with its corresponding unit of measurement
- **FR-004**: The dashboard MUST refresh sensor data automatically at least every 5 seconds
- **FR-005**: The dashboard MUST show node connection status (connected/disconnected)
- **FR-006**: The dashboard MUST use nyx-kit components for all UI primitives (buttons, cards, layouts)
- **FR-007**: The application MUST use Vue Router for navigation
- **FR-008**: The application MUST use Pinia for state management of sensor data

### Key Entities

- **Node**: Represents the single device pushing telemetry data, has identifier and connection status
- **Sensor Reading**: A single measurement from a sensor, has sensor type, value, and unit
- **Sensor Unit**: A category of measurement (e.g., temperature, humidity, light level, soil moisture)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view the dashboard and see all sensor readings within 3 seconds of page load
- **SC-002**: All sensor values update on the dashboard within 5 seconds of new data arriving at the server
- **SC-003**: Node connection status is accurately displayed within 30 seconds of disconnection
- **SC-004**: The dashboard displays all sensor types that have been received from the node

## Assumptions

- The server API endpoint for fetching sensor data is available at `/api/readings` or similar
- The node pushes data at approximately 1-second intervals as described in architecture
- Sensor types are limited to: temperature, humidity, light (lux), soil moisture (and potentially others)
- The server runs on the same host and serves the Vue frontend

## Dependencies

- Server backend must be running to serve telemetry data
- nyx-kit component library must be available (package: nyx-kit)
- Vue 3 with Composition API is used
- SCSS is available for styling
