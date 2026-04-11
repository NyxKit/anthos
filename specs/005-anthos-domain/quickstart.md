# Quickstart: Anthos Domain Layer

## Goal

Set up a single shared Anthos instance and use it as the only backend-facing entry point from stores.

## Flow

1. Import the shared Anthos instance from the shared domain entry point.
2. Create it with setup data when available, or create it first and call setup later.
3. Update stores to request node data through Anthos and keep only local UI state in Pinia.

## Expected Result

- Node data is fetched through one shared boundary.
- Stores no longer call backend routes directly for migrated flows.
- Future room, alert, and user entry points remain available as scaffolds.
