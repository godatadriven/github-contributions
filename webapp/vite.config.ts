import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['src/assets/github_contributions.duckdb'],
  plugins: [react()],
  base: '/github-contributions/',
  server: {
    headers: {
      'Cache-Control': 'public, max-age=604800, immutable'
    }
  }
});
