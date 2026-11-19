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
  // Self-hosted and preloaded. "optional": if the font isn't ready within about 100ms (a slow
  // first visit), the page keeps its fallback monospace instead of swapping and re-wrapping
  // text. Fallback widths vary by system (Linux often lacks Courier New), so a swap could
  // shift the page.
  fonts: [
    {
      // The Latin variable font from the installed Fontsource package: one file, every weight.
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains',
      display: 'optional',
      fallbacks: ['monospace'],
      options: {
        variants: [
          {
            src: [
              './node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
            ],
            weight: '100 800',
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
