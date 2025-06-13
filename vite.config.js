// vite.config.js
// This file should be in your project's root directory, NOT inside src/.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/AIAcademicAdvisor/', // Make sure this matches your GitHub repo name with leading/trailing slashes
  plugins: [
    react(),
    // Add this plugin for Node.js polyfills in the browser environment
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
    target: 'esnext', // Set a modern target to avoid BigInt issues
    rollupOptions: {
      external: [
        /^node:/,
        'path', 'fs', 'tty', 'util', 'net', 'http', 'stream', 'os',
        'child_process', 'crypto', 'assert', 'zlib', 'tls', 'https', 'module', 'events',
      ],
    },
  },
})
