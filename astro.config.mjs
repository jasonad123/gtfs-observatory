import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dmv-gtfs-dev.pages.dev',
  output: 'static',

  build: {
    assets: 'assets'
  },

});