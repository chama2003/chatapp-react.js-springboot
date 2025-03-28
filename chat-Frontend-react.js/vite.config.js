import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      global: 'node-libs-browser/mock/empty', // Polyfill for global
    },
  },
  define: {
    global: 'window', // Polyfill for global
  },
});
