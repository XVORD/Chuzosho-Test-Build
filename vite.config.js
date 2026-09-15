import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import './scripts/generate-pages.mjs';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'spa-route-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          // Prevent copied upstream HTML files from bypassing the React router.
          if (req.url && req.url.endsWith('/') && !req.url.startsWith('/assets/')) req.url = '/';
          next();
        });
      }
    }
  ]
});
