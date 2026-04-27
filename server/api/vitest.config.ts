import { resolve } from 'node:path'

export default {
  resolve: {
    alias: {
      '@anthos/shared/nodes': resolve(__dirname, '../../shared/src/nodes'),
      '@anthos/shared/users': resolve(__dirname, '../../shared/src/users'),
      '@anthos/shared/automations': resolve(__dirname, '../../shared/src/automations.ts'),
      '@anthos/shared/logs': resolve(__dirname, '../../shared/src/logs.ts'),
      '@anthos/shared/dashboard': resolve(__dirname, '../../shared/src/dashboard.ts'),
      '@anthos/shared/commands': resolve(__dirname, '../../shared/src/commands.ts'),
      '@anthos/shared/power-profiles': resolve(__dirname, '../../shared/src/power-profiles.ts'),
      '@anthos/shared': resolve(__dirname, '../../shared/src/index.ts'),
      '@anthos/shared/anthos': resolve(__dirname, '../../shared/src/anthos/index.ts'),
    },
  },
  test: {
    environment: 'node',
  },
}
