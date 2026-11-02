import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import './scripts/generate-pages.mjs';

export default defineConfig({
  plugins: [react()],
  base: '/',
});
