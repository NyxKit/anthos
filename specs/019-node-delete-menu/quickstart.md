# Quickstart: Node Actions Menu

## Verification Commands

- Run API tests: `pnpm --filter @anthos/api test -- server/api/tests/node-registry.service.test.ts server/api/tests/provision.controller.test.ts`
- Run app tests: `pnpm --filter anthos-app test -- app/src/dashboard/components/NodeCard.test.ts app/src/dashboard/components/NodeCardActions.test.ts`
- Run the full app suite if needed: `pnpm --filter anthos-app test`

## Manual Check

1. Open the nodes page with at least one online node and one offline node.
2. Open the three-dot menu on each node and confirm the menu is enabled in both states.
3. Start the delete flow and confirm the warning mentions that the node must be manually reset.
4. Confirm deletion and verify the node disappears from the list.
5. Let the same hardware report again without a manual reset and verify the node is recreated automatically.
