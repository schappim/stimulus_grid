import { defineConfig } from 'vite';
import { resolve } from 'path';

/* Library build — produces two flavors:
 *
 *   dist/stimulus_grid.js       IIFE, includes @hotwired/stimulus inline.
 *                               Drop into a static <script> tag and call
 *                               window.StimulusGrid.start(). Use for plain
 *                               HTML / file:// / non-bundler consumers.
 *
 *   dist/stimulus_grid.esm.js   ESM module, externalizes @hotwired/stimulus.
 *                               Use with importmaps (Rails) or any ES-module
 *                               consumer that pins stimulus separately.
 *
 *   dist/stimulus_grid.css      Shared default theme, identical content.
 *
 * Switch between formats by passing the env var:
 *   FORMAT=iife npx vite build --config vite.lib.config.js
 *   FORMAT=es   npx vite build --config vite.lib.config.js
 *
 * `npm run build:lib` builds both in sequence.
 */
const FORMAT = process.env.FORMAT || 'iife';

const isES = FORMAT === 'es';

export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'StimulusGrid',
      fileName: () => isES ? 'stimulus_grid.esm.js' : 'stimulus_grid.js',
      formats: [FORMAT],
    },
    rollupOptions: {
      external: isES ? ['@hotwired/stimulus'] : [],
      output: {
        assetFileNames: (info) => info.name.endsWith('.css') ? 'stimulus_grid.css' : info.name,
        globals: {},
        extend: true,
        ...(isES ? {} : {}),
      },
    },
    sourcemap: true,
    target: 'es2020',
  },
});
