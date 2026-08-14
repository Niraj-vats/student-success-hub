import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});
