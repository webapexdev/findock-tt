import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Allow external connections (needed for VPN)
    port: 5173, // Default Vite port
    strictPort: false, // Allow port changes if 5173 is unavailable
    watch: {
      usePolling: true, // Use polling for file watching (better with VPN)
    },
  },
})
