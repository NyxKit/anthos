# Roadmap

This roadmap focuses on the next product-level capabilities Anthos needs to feel complete and reliable for real home use.

## Priority Levels

- P0: critical foundation work
- P1: near-term product value
- P2: important but not blocking
- P3: later polish and expansion

## Now

- [P0] Docker integration for the server, similar to `nyx-notes`
- [P0] Node firmware power profile work so hardware stays off unless it is actively needed
- [P1] Native mobile app for Bluetooth pairing and mobile monitoring

## Next

- [P1] Node health visibility in the dashboard, including connectivity, uptime, and sensor status
- [P1] Basic alerting for node offline events and sensor failures
- [P2] Configuration backup and restore for the server and node setup
- [P1] Authentication for anything exposed beyond the local network

## Later

- [P2] Remote access support for trusted off-site monitoring
- [P2] OTA firmware update flow for nodes
- [P2] Historical trends and export tools for readings
- [P3] Per-node diagnostics and maintenance view

## Notes

- P0 items are foundational and should happen before broader feature work.
- P1 items are the next product milestones after the core platform is stable.
- P2 items should follow once the main experience is usable end to end.
- P3 items are useful refinements, but not required for the first solid release.

## Open Questions

- Which sensors can be safely power-gated without affecting startup time or stability?
- Should mobile monitoring be read-only at first, or include provisioning and node actions?
- Do we want the dashboard and mobile app to share the same API surface from day one?
