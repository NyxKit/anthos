import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@anthos/shared': resolve(__dirname, '../shared/src'),
    },
  },
  clearScreen: false,
  test: {
    environment: 'jsdom',
  },
  server: {
    port: 1440,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
})
