# Research: Anthos Domain Layer

## 1. Shared singleton domain

- Decision: Use a single shared Anthos instance as the entry point for backend-facing operations.
- Rationale: This keeps connection state in one place, supports late setup, and gives stores a stable dependency surface.
- Alternatives considered: Creating one client per store; passing connection state through every call; keeping direct backend calls in stores.

## 2. Setup flow

- Decision: Support both construction-time setup and deferred setup through a dedicated method.
- Rationale: The app may not know authorization details at startup, so the domain must remain usable until setup data arrives.
- Alternatives considered: Constructor-only initialization; rebuilding the instance whenever credentials change.

## 3. First migrated surface

- Decision: Start with nodes and telemetry-related reads while leaving rooms, alerts, and users as scaffolds.
- Rationale: This matches the current app needs and limits the first migration to the highest-value paths.
- Alternatives considered: Migrating every store at once; postponing all migration until future features arrive.

## 4. Store responsibility split

- Decision: Keep stores responsible for state shaping, loading flags, and UI-specific derivations only.
- Rationale: This preserves current Pinia responsibilities while removing backend wiring from the presentation layer.
- Alternatives considered: Moving all state logic into Anthos; introducing a separate repository/service layer inside each store.
