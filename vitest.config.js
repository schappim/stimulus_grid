import { defineConfig } from 'vitest/config';

/* Unit-test config for the JS core. Kept separate from vite.config.js (which
 * serves the demo pages) so the two never entangle. Vitest auto-prefers this
 * file over vite.config.js.
 *
 * The display-list pipeline in src/lib/model.js is pure (no DOM), so the
 * default `node` environment is enough and keeps the suite fast. Add
 * `environment: 'jsdom'` here if/when we test DOM-coupled controllers. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.js'],
    globals: false,
  },
});
