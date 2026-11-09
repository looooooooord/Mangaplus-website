import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * The preview hostname is supplied by the environment (PREVIEW_HOST) rather than
 * being hardcoded, so the same config works locally and in the hosted preview.
 */
const previewHost = process.env.PREVIEW_HOST;

// GitHub Pages project sites are served from /<repository>/, so the base path
// is supplied by the deployment environment while local development stays at /.
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: previewHost ? [previewHost] : ['localhost'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: previewHost ? [previewHost] : ['localhost'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
});
