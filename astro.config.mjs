import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dc-gtfs-dashboard.example.com',
  output: 'static',
  build: {
    assets: 'assets'
  }
});
