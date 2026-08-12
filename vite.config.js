import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nwsApiMiddleware } from './server/nwsApi.js'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'nws-api',
      configureServer(server) {
        server.middlewares.use(nwsApiMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(nwsApiMiddleware());
      },
    },
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
