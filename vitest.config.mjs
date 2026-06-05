import { defineConfig } from 'vitest/config'
import path from 'path'
import { transform } from 'esbuild'

// Node environment is sufficient for the helper-level unit tests in this repo
// (dedup, scroll controllers, useModalOpen counter store). Components/hooks
// that need a DOM should pass `// @vitest-environment jsdom` per-file when
// they're added — keeps the default environment fast.
//
// This codebase keeps JSX in .js files. Vite's per-extension loader treats .js
// as plain JS, so a pre-transform runs esbuild's jsx loader (automatic runtime,
// React 19) on src .js files before Vite parses them. JSX is a JS superset, so
// pure-logic files pass through unchanged.
const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    const file = id.split('?')[0]
    if (!/[\\/]src[\\/].*\.js$/.test(file) || !code.includes('<')) return null
    const result = await transform(code, {
      loader: 'jsx', jsx: 'automatic', sourcemap: true, sourcefile: file,
    })
    return { code: result.code, map: result.map }
  },
}

export default defineConfig({
  plugins: [jsxInJs],
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
