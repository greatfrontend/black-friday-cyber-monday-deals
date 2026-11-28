import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4177';

export default defineConfig({
  testDir: './tests/e2e',
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: 'vp build && vp preview --host 127.0.0.1 --port 4177 --strictPort',
    url: baseURL,
  },
});
