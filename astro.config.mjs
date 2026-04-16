import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://quitdr.com.au',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
