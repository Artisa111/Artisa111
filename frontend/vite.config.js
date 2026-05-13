import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mediapipe/hands': '@mediapipe/hands',
      '@mediapipe/camera_utils': '@mediapipe/camera_utils',
    }
  },
  optimizeDeps: {
    include: ['@mediapipe/hands', '@mediapipe/camera_utils']
  },
  server: {
    host: true, // Listen on all local IPs
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
})
