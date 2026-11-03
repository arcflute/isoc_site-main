import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()], server: { fs: { deny: ['**/_reference/**', '**/.local/**', '**/.env*'] } } },
});
