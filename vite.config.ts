import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// base './' + HashRouter : fonctionne sur Vercel, GitHub Pages (sous-chemin) et Cloudflare Pages sans config SPA.
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'FlashLearn', short_name: 'FlashLearn', lang: 'fr',
        description: 'Révision par cartes avec répétition espacée',
        theme_color: '#2563eb', background_color: '#0f172a', display: 'standalone',
        start_url: './', scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,json}'] },
    }),
  ],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
