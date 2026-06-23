// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://smartpioneer.netlify.app', // ← ganti dengan domain Anda

  // Output hybrid: SSG default + SSR untuk route API
  output: 'hybrid',
  adapter: netlify(),

  integrations: [
    // Tailwind CSS dengan Pi theme
    tailwind({
      applyBaseStyles: false, // kita handle di global.css
    }),

    // React untuk PersistentPlayer dan komponen interaktif
    react(),

    // Auto-generate sitemap.xml
    sitemap({
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  // View Transitions sudah built-in di Astro 4 — tidak perlu experimental flag
  // Gunakan <ViewTransitions /> component di BaseLayout.astro

  // Image optimization bawaan Astro
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    remotePatterns: [
      { protocol: 'https', hostname: '**.ctfassets.net' },      // Contentful
      { protocol: 'https', hostname: '**.coindesk.com' },
      { protocol: 'https', hostname: '**.cointelegraph.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Build optimization
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },

  vite: {
    optimizeDeps: {
      include: ['howler'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'howler': ['howler'],
            'framer': ['framer-motion'],
          },
        },
      },
    },
  },
});
