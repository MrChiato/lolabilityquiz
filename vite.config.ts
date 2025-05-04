import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oauth': {
        target: 'https://oauth.battle.net',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/oauth/, ''),
      },
      '/blizzard': {
        target: 'https://eu.api.blizzard.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/blizzard/, ''),
      },
    },
  },
});
