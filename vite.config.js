// vite.config.js
// This file should be in your project's root directory.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/AIAcademicAdvisor/', // IMPORTANT: Ensure this matches your GitHub repo name with leading/trailing slashes
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  build: {
    target: 'esnext', // Keep a modern target
    rollupOptions: {
      // These modules should generally not be bundled for a browser frontend.
      // Keeping this as a safety measure.
      external: [
        /^node:/,
        'path', 'fs', 'tty', 'util', 'net', 'http', 'stream', 'os',
        'child_process', 'crypto', 'assert', 'zlib', 'tls', 'https', 'module', 'events',
      ],
    },
  },
})
