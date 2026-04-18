# Research: Nodes Grid

## Decision 1: Make `NodesGrid` a shared view component backed by the existing nodes store
- Decision: The reusable grid will read from the current store-backed node list rather than introduce a new source of truth.
- Rationale: Both dashboard and nodes page already consume the same node collection, so reuse keeps behavior aligned and avoids duplicating filter/sort logic.
- Alternatives considered: Separate grid-specific store state, duplicating node rendering in each page.

## Decision 2: Use an optional `limit` prop as the only public input
- Decision: The component exposes one optional `limit` prop and otherwise derives its content from the store.
- Rationale: The dashboard needs a compact subset, while the nodes page needs the full list; one knob covers both cases.
- Alternatives considered: Separate props for page mode, explicit node arrays, or a limit plus filter flags.

## Decision 3: Keep claimed-node presentation in the shared grid and preserve claiming outside it
- Decision: The shared grid will represent claimed nodes, while unclaimed nodes and claim actions remain part of the nodes page outside the grid itself.
- Rationale: This preserves the existing onboarding flow without making the reusable component responsible for registration or modal state.
- Alternatives considered: Folding claim actions into the shared grid, or creating a second grid variant for unclaimed nodes.

## Decision 4: Default dashboard usage remains a compact summary
- Decision: The dashboard will use the shared grid with a small fixed limit.
- Rationale: The dashboard is for at-a-glance status, not full management.
- Alternatives considered: Showing the full node list on the dashboard or introducing a separate dashboard-specific list.
