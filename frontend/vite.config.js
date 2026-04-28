import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Bind to all interfaces so the container is reachable from the host
    host: '0.0.0.0',
    proxy: {
      '/api': {
        // In Docker the backend is reachable via service name, not localhost
        target: process.env.VITE_API_URL || 'http://backend:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
});
