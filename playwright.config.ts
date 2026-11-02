import { defineConfig, devices } from '@playwright/test';

const iPhone17ProMax = {
  ...devices['iPhone 15 Pro Max'],
  viewport: { width: 440, height: 956 },
};

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173' },
  projects: [
    { name: 'iphone', use: { ...iPhone17ProMax, browserName: 'webkit' }, testIgnore: /offline/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testMatch: /offline/ },
  ],
  webServer: [
    {
      command: 'npx tsx scripts/dev-api.ts',
      port: 4174,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: 'npm run build:e2e && npx vite preview --outDir dist-e2e --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
