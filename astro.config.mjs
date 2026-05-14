import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://tuberankAI.up.railway.app',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
