// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://xzanderbr.github.io',
  trailingSlash: 'always',
  integrations: [react(), mdx(), sitemap()],
  // Self-hosted. Astro preloads the file and generates a fallback font with matched
  // metrics, so text doesn't move when Hanken Grotesk arrives (Linux and Windows
  // fallbacks are much wider than it).
  fonts: [
    {
      // The Latin variable font from the installed Fontsource package: one file, every weight.
      provider: fontProviders.local(),
      name: 'Hanken Grotesk',
      cssVariable: '--font-hanken',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            src: [
              './node_modules/@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2',
            ],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
