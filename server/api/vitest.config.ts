import { resolve } from 'node:path'

export default {
  resolve: {
    alias: {
      '@anthos/shared': resolve(__dirname, '../../shared/src/index.ts'),
      '@anthos/shared/anthos': resolve(__dirname, '../../shared/src/anthos/index.ts'),
    },
  },
  test: {
    environment: 'node',
  },
}
