import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',

    // Enable global test functions (describe, it, expect)
    globals: true,

    // Setup files run before each test file
    setupFiles: ['./tests/setup.ts'],

    // Include test files
    include: ['**/*.{test,spec}.{ts,tsx}'],

    // Exclude node_modules and build directories
    exclude: ['node_modules', '.next', 'dist'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '.next/',
      ],
    },

    // Timeout for async tests
    testTimeout: 10000,
  },

  // Resolve path aliases (matches tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
