import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ FIXED: loadEnv lets us read .env variables inside vite.config.js
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          // ✅ Uses VITE_API_URL from .env in dev, falls back to localhost
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    }
  }
})
