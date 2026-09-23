import { cp, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const FIXTURE_EXHIBITS = 'tests/fixtures/exhibits';
export const FIXTURE_RAW = 'tests/fixtures/raw';

/** Copies the fixture exhibits and site copy into a fresh temporary directory. */
export async function tempFixtures() {
  const root = await mkdtemp(join(tmpdir(), 'saigallery-'));
  const dir = join(root, 'exhibits');
  const siteDir = join(root, 'site');
  await cp(FIXTURE_EXHIBITS, dir, { recursive: true });
  await cp('src/content/site', siteDir, { recursive: true });
  return { root, dir, siteDir };
}
