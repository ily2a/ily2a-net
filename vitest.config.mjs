import { defineConfig } from 'vitest/config'
import path from 'path'

// Node environment is sufficient for the helper-level unit tests in this repo
// (dedup, scroll controllers, useModalOpen counter store). Components/hooks
// that need a DOM should pass `// @vitest-environment jsdom` per-file when
// they're added — keeps the default environment fast.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{js,mjs}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
})
