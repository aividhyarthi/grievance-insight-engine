import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://driveease.in',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
});
