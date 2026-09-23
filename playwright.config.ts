import { defineConfig, devices } from '@playwright/test';

// Two galleries, each with its own build output so they never overwrite each other:
// - 4321: the 40-exhibit fixture gallery (dist/)
// - 4322: an empty gallery for the empty-state test (dist-empty/)
// The builds run one after the other (they share Astro's generated .astro/ folder), then one
// process serves both. scripts/serve-dist.mjs is used because Astro 7's `astro preview`
// detaches into a locked background daemon when it has no terminal.
const env = 'ASTRO_TELEMETRY_DISABLED=1';
const buildFixtures = `${env} SITE_URL=http://localhost:4321 EXHIBITS_DIR=tests/fixtures/exhibits pnpm build`;
const buildEmpty = `${env} SITE_URL=http://localhost:4322 EXHIBITS_DIR=tests/fixtures/empty sh -c 'node scripts/verify-exhibits.mjs && pnpm exec astro build --outDir dist-empty'`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'] },
  projects: [
    { name: 'fixtures', testIgnore: /empty\.spec\.ts/, use: { baseURL: 'http://localhost:4321' } },
    { name: 'empty', testMatch: /empty\.spec\.ts/, use: { baseURL: 'http://localhost:4322' } },
  ],
  webServer: {
    command: `${buildEmpty} && ${buildFixtures} && node scripts/serve-dist.mjs dist:4321 dist-empty:4322`,
    url: 'http://127.0.0.1:4321/',
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
