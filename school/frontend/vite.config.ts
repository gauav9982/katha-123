import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/school-app/',
  plugins: [react()],
  server: {
    port: 5179, // School frontend runs on this port
    proxy: {
      '/api': {
        target: 'http://localhost:4009', // School backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 