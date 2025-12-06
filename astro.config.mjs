import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://dmv-gtfs-dev.pages.dev',
  output: 'static',

  build: {
    assets: 'assets'
  },

  adapter: cloudflare()
});