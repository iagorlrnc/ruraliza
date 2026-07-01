import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group lucide icons together
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            // Group leaflet map libraries
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }
            // Group supabase packages
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Group core dependencies
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('@tanstack')) {
              return 'vendor-core';
            }
            // Group other node_modules dependencies
            return 'vendor-others';
          }
        }
      }
    }
  }
})
