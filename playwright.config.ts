import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { browserName: 'chromium', channel: 'msedge', headless: true, baseURL: 'http://127.0.0.1:4321', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4321', url: 'http://127.0.0.1:4321', reuseExistingServer: true, timeout: 60000 },
    { command: 'node scripts/preview.mjs', url: 'http://127.0.0.1:4322', reuseExistingServer: true, timeout: 60000 },
  ],
});
