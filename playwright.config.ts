import { defineConfig, devices } from '@playwright/test';

// Two galleries, each with its own build output so they never overwrite each other:
// - 4321: the 40-exhibit fixture gallery (dist/)
// - 4322: an empty gallery for the empty-state test (dist-empty/)
// The builds run one after the other (they share Astro's generated .astro/ folder), then one
// process serves both. scripts/serve-dist.mjs is used because Astro 7's `astro preview`
// detaches into a locked background daemon when it has no terminal.
// Override with E2E_PORT / E2E_EMPTY_PORT when 4321/4322 are busy (e.g. a running dev server).
const port = Number(process.env.E2E_PORT ?? 4321);
const emptyPort = Number(process.env.E2E_EMPTY_PORT ?? 4322);
const env = 'ASTRO_TELEMETRY_DISABLED=1';
const buildFixtures = `${env} SITE_URL=http://localhost:${port} EXHIBITS_DIR=tests/fixtures/exhibits pnpm build`;
const buildEmpty = `${env} SITE_URL=http://localhost:${emptyPort} EXHIBITS_DIR=tests/fixtures/empty sh -c 'node scripts/verify-exhibits.mjs && pnpm exec astro build --outDir dist-empty'`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    // Only the devcontainer sets PW_NO_SANDBOX (it blocks Chromium's sandbox); elsewhere it stays on.
    launchOptions: process.env.PW_NO_SANDBOX ? { chromiumSandbox: false } : {},
  },
  projects: [
    { name: 'fixtures', testIgnore: /empty\.spec\.ts/, use: { baseURL: `http://localhost:${port}` } },
    { name: 'empty', testMatch: /empty\.spec\.ts/, use: { baseURL: `http://localhost:${emptyPort}` } },
  ],
  webServer: {
    command: `${buildEmpty} && ${buildFixtures} && node scripts/serve-dist.mjs dist:${port} dist-empty:${emptyPort}`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
