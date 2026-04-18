# Quickstart: Remove Node Claiming

1. Open the node management UI and confirm all nodes appear directly in the main list.
2. Verify there are no claim prompts, claim buttons, or unclaimed/claimed sections.
3. Create or register a node and confirm it appears without any extra naming or claim step.
4. Change a node name or settings and verify the update works without any claim boundary.
5. Confirm the node API no longer exposes claim-specific payloads or routes.

## Verification Targets
- Node list shows immediately available nodes.
- API responses contain no claim status.
- Firmware registration still succeeds and telemetry continues normally.
