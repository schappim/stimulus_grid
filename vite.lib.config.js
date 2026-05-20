import { defineConfig } from 'vite';
import { resolve } from 'path';

/* Library build — outputs self-contained dist/stimulus_grid.js (IIFE, includes
 * @hotwired/stimulus) and dist/stimulus_grid.css. Demos load these via plain
 * <script> and <link> tags, so they work without any bundler (file://, plain
 * static server, vite dev — all fine). */
export default defineConfig({
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'StimulusGrid',
      fileName: () => 'stimulus_grid.js',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        assetFileNames: (info) => info.name.endsWith('.css') ? 'stimulus_grid.css' : info.name,
        globals: {},
        extend: true,
      },
    },
    sourcemap: true,
    target: 'es2020',
  },
});
