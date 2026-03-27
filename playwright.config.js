import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    browserName: 'chromium',
  },
  webServer: {
    command: 'npx serve . --listen 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
