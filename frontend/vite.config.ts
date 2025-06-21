import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Set a fixed port for development
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:4000', // Your backend server port
        changeOrigin: true,
        secure: false,
      }
    }
  }
}) 