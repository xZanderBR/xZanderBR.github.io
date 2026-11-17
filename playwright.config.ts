import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${PORT}` },
  // Firefox runs in CI (Linux). Locally it is opt-in with PW_FIREFOX=1, because
  // Playwright's Firefox build fails to launch on the newest macOS.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ...(process.env.CI || process.env.PW_FIREFOX
      ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }]
      : []),
  ],
  webServer: {
    command: process.env.CI
      ? `bun run preview --port ${PORT} --ignore-lock`
      : `bun run build && bun run preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
