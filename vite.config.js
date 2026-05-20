import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

const demoDir = resolve(__dirname, 'demo');
const demoPages = Object.fromEntries(
  readdirSync(demoDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), resolve(demoDir, f)])
);

export default defineConfig({
  root: 'demo',
  publicDir: resolve(__dirname, 'demo/public'),
  resolve: {
    alias: {
      'stimulus_grid': resolve(__dirname, 'src/index.js'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: demoPages,
    },
  },
  server: {
    port: 5173,
    open: false,
    strictPort: false,
    fs: {
      allow: [resolve(__dirname, '.')],
    },
  },
});
