import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  server: {
    watch: {
      // Windows locks files while PNGs are copied in; polling avoids EBUSY crashes
      // and still picks up new images in public/ without a restart.
      usePolling: true,
      interval: 500,
    },
  },
})
