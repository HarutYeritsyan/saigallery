import { execFile } from 'node:child_process';
import { readdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { parse } from 'node-html-parser';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain .mjs module without type declarations
import { verify } from '../../scripts/verify-exhibits.mjs';
import { tempFixtures } from './helpers';

const run = promisify(execFile);

async function unpublish(dir: string, number: string) {
  return run('node', ['scripts/exhibit-unpublish.mjs', number], { env: { ...process.env, EXHIBITS_DIR: dir } });
}

describe('exhibit:unpublish', () => {
  it('turns an exhibit into a tombstone and removes its image', async () => {
    const { dir, siteDir } = await tempFixtures();
    await unpublish(dir, '17');
    expect(await readFile(join(dir, '017.md'), 'utf8')).toBe('---\nstatus: unpublished\n---\n');
    expect(await readdir(dir)).not.toContain('017.webp');
    expect(await verify({ dir, siteDir })).toEqual([]);
  });

  it('refuses an exhibit that is already unpublished or does not exist', async () => {
    const { dir } = await tempFixtures();
    await expect(unpublish(dir, '042')).rejects.toMatchObject({ code: 1 });
    await expect(unpublish(dir, '999')).rejects.toMatchObject({ code: 1 });
  });

  it('after a rebuild, leaves nothing of the exhibit on the site (V9, V21)', async () => {
    const { dir } = await tempFixtures();
    await unpublish(dir, '017');
    // Inside the project on purpose: Astro moves build files with rename(), which fails across
    // filesystems (e.g. to /tmp). dist-*/ is git-ignored.
    const out = join(process.cwd(), 'dist-unpublish');
    await rm(out, { recursive: true, force: true });
    await run('pnpm', ['exec', 'astro', 'build', '--outDir', out], {
      env: { ...process.env, EXHIBITS_DIR: dir, SITE_URL: 'http://localhost:4321', ASTRO_TELEMETRY_DISABLED: '1' },
    });

    const html = await readFile(join(out, 'exhibits', '017', 'index.html'), 'utf8');
    const page = parse(html);
    expect(page.querySelector('h1')?.textContent).toBe('Exhibit No. 017 is no longer available.');
    expect(html).not.toContain('The Seventeenth Square');
    expect(page.querySelector('meta[property="og:image"]')).toBeNull();
    expect(await readdir(join(out, '_astro'))).not.toEqual(expect.arrayContaining([expect.stringMatching(/^017\./)]));

    const index = await readFile(join(out, 'page', '2', 'index.html'), 'utf8');
    expect(index).not.toContain('/exhibits/017/');
  });
});
