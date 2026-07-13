import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: (() => {
      // When running inside Docker, use the service name. Outside Docker, use localhost.
      const apiBase = process.env.API_BASE_URL || 'http://localhost:8000'
      const proxyEntry = { target: apiBase, changeOrigin: true }
      return {
        '/assets':      proxyEntry,
        '/auth':        proxyEntry,
        '/orgs':        proxyEntry,
        '/health':      proxyEntry,
        '/docs':        proxyEntry,
        '/redoc':       proxyEntry,
        '/openapi.json': proxyEntry,
      }
    })(),
  },
  build: {
    outDir: '../app/static',
    emptyOutDir: true,
    assetsDir: 'ui-assets',
  },
})
