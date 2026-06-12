import { defineConfig } from 'vitest/config'
import path from 'path'

// Node environment is sufficient for the helper-level unit tests in this repo
// (dedup, scroll controllers, modal-store counter). Components/hooks that need a
// DOM pass `// @vitest-environment jsdom` per-file — keeps the default
// environment fast. Vite/esbuild transpiles .ts/.tsx natively.
export default defineConfig({
  // React 19 automatic JSX runtime — components don't import React, so the
  // classic runtime (esbuild's default) would throw "React is not defined".
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    // Dummy Sanity env so importing modules that pull in src/sanity/env.ts
    // (e.g. the pure displayHeightFor helper in src/sanity/lib/image.ts) doesn't
    // throw at import time. Never used to make a real request in tests.
    env: {
      NEXT_PUBLIC_SANITY_DATASET: 'test-dataset',
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'test-project',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
})
