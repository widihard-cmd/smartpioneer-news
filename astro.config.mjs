// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pangeranxnyamat.github.io',
  base: '/smartpioneer-news',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [tailwind(), sitemap()],
});