import { defineConfig } from 'vite';
import { readdirSync } from 'fs';
import { resolve } from 'path';

// Build every page in frontend/ so the multi-page app is fully bundled.
const pages = {};
for (const file of readdirSync(resolve(__dirname, 'frontend'))) {
  if (file.endsWith('.html')) {
    pages[file.replace('.html', '')] = resolve(__dirname, 'frontend', file);
  }
}

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: { input: pages }
  },
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
