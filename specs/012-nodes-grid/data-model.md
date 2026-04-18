# Data Model: Nodes Grid

## Node
- Represents a physical node shown in the product.
- Key fields: `id`, `nodeId`, `displayName`, `claimStatus`, `capability`, `order`, `registeredAt`, `powerProfile`.
- Relationships: A node belongs to the shared node collection and may appear in the dashboard summary or full nodes page grid when claimed.

## Nodes Grid View State
- Represents how the shared grid is displayed on a page.
- Key fields: `limit` (optional), derived visible nodes, empty-state status.
- Relationships: Consumes the shared node collection and renders a page-specific subset.

## Claim Flow State
- Represents the current node selected for claiming and the claim form visibility.
- Key fields: selected node, open/closed state, submission result.
- Relationships: Used only on the nodes page alongside the shared grid; not part of the grid itself.

## Validation Rules
- `limit` is optional.
- If `limit` is provided, it caps the number of displayed claimed nodes.
- The shared grid shows claimed nodes only.
- Unclaimed nodes remain visible only in the separate claim flow area.
