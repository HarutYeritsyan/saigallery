import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { inspectImage } from '../../src/lib/image-metadata';
// @ts-expect-error — plain .mjs module without type declarations
import { verify } from '../../scripts/verify-exhibits.mjs';
import { FIXTURE_RAW, tempFixtures } from './helpers';

const run = promisify(execFile);

async function add(dir: string, input: string) {
  return run('node', ['scripts/exhibit-add.mjs', input], { env: { ...process.env, EXHIBITS_DIR: dir } });
}

describe('exhibit:add (V6)', () => {
  for (const raw of ['with-exif.jpg', 'with-xmp.webp', 'with-params.png']) {
    it(`cleans ${raw} and creates a draft under the next number`, async () => {
      const { dir, siteDir } = await tempFixtures();
      const { stdout } = await add(dir, join(FIXTURE_RAW, raw));

      // 042 is the highest existing number (a tombstone), so the next is 043.
      const image = join(dir, '043.webp');
      expect(await inspectImage(image)).toEqual([]);
      const bytes = await readFile(image);
      expect(bytes.includes('SOURCE-MARKER')).toBe(false);

      const entry = await readFile(join(dir, '043.md'), 'utf8');
      expect(entry).toBe('---\nstatus: draft\nimage: ./043.webp\nalt: ""\n---\n');
      expect(entry).not.toContain(raw);
      expect(stdout).toContain('043');
      expect(stdout).toMatch(/crop or cover/i);
      expect(stdout).not.toContain(raw);

      // A fresh draft is valid as-is.
      expect(await verify({ dir, siteDir })).toEqual([]);
    });
  }

  it('rejects a file that is not an image and creates nothing', async () => {
    const { dir } = await tempFixtures();
    const before = await readdir(dir);
    await expect(add(dir, join(FIXTURE_RAW, 'not-an-image.jpg'))).rejects.toMatchObject({ code: 1 });
    expect(await readdir(dir)).toEqual(before);
  });
});
