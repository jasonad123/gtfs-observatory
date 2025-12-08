import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gtfs-observatory.pages.dev',
  output: 'static',

  build: {
    assets: 'assets'
  },

});