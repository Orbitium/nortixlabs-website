import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const buildVersion = `V${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}`;

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  site: 'https://nortixlabs.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [react(), sitemap()],

  vite: {
    define: {
      __BUILD_VERSION__: JSON.stringify(buildVersion)
    },
    plugins: [tailwindcss()]
  }
});
