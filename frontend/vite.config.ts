import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections (needed for VPN)
    port: 5173, // Default Vite port
    strictPort: false, // Allow port changes if 5173 is unavailable
    watch: {
      usePolling: true, // Use polling for file watching (better with VPN)
    },
  },
})
