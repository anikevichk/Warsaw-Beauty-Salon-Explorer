/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-dev-runtime': path.resolve(
        __dirname,
        'node_modules/react/jsx-dev-runtime.js'
      ),
      '@testing-library/react': path.resolve(
        __dirname,
        'node_modules/@testing-library/react'
      ),
      '@testing-library/user-event': path.resolve(
        __dirname,
        'node_modules/@testing-library/user-event'
      )
    }
  },

  server: {
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['../tests/frontend_tests/**/*.{test,spec}.{ts,tsx}']
  }
})