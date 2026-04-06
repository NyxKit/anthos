# Research: Telemetry Dashboard

## Decisions Made

### Technology Stack
- **Decision**: Vue 3 + TypeScript frontend
- **Rationale**: Matches existing project patterns (nyx-notes), nyx-kit requires Vue 3
- **Alternatives considered**: None - nyx-kit is Vue-only

### Component Library
- **Decision**: nyx-kit for all UI primitives
- **Rationale**: Required by user specification, provides consistent design system
- **Alternatives considered**: Custom components (rejected - extra maintenance)

### State Management
- **Decision**: Pinia for sensor data state
- **Rationale**: Matches nyx-notes, Vue 3 standard for state management
- **Alternatives considered**: Vuex (legacy, more verbose)

### Data Fetching
- **Decision**: Polling-based with 5-second refresh
- **Rationale**: Simple prototype approach, aligns with server push interval
- **Alternatives considered**: WebSockets (future enhancement)

### API Pattern
- **Decision**: REST API via ofetch
- **Rationale**: Matches nyx-notes pattern, simple GET endpoint for readings
- **Alternatives considered**: GraphQL (overkill for prototype)

## No Clarifications Needed

The feature specification was clear on all technical aspects. No additional research required.
