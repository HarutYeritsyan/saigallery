import { execFile } from 'node:child_process';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
// @ts-expect-error — plain .mjs module without type declarations
import { verify } from '../../scripts/verify-exhibits.mjs';
import { FIXTURE_RAW, tempFixtures } from './helpers';

const run = promisify(execFile);

async function problemsAfter(change: (dir: string, siteDir: string) => Promise<void>) {
  const { dir, siteDir } = await tempFixtures();
  await change(dir, siteDir);
  return (await verify({ dir, siteDir })) as string[];
}

async function edit(file: string, fn: (text: string) => string) {
  await writeFile(file, fn(await readFile(file, 'utf8')));
}

describe('verify-exhibits', () => {
  it('accepts the clean fixtures', async () => {
    expect(await problemsAfter(async () => {})).toEqual([]);
  });

  it('rejects a source key (V8)', async () => {
    const problems = await problemsAfter((dir) =>
      edit(join(dir, '005.md'), (t) => t.replace('status:', 'source: "https://example.com/p/1"\nstatus:')),
    );
    expect(problems.join('\n')).toMatch(/005\.md: unknown frontmatter key "source"/);
  });

  it('rejects a published exhibit with an empty caption (V7)', async () => {
    const problems = await problemsAfter((dir) => edit(join(dir, '006.md'), (t) => t.replace(/---\n[^-]*$/, '---\n')));
    expect(problems.join('\n')).toMatch(/006\.md: published exhibit has an empty caption/);
  });

  it('rejects alt text identical to the caption', async () => {
    const problems = await problemsAfter((dir) =>
      edit(join(dir, '007.md'), (t) => t.replace(/alt: .*/, 'alt: "Same text."').replace(/---\n[^-]*$/, '---\nSame text.\n')),
    );
    expect(problems.join('\n')).toMatch(/007\.md: alt text must differ from the caption/);
  });

  it('rejects a raw image with metadata and a non-catalog name', async () => {
    const problems = await problemsAfter((dir) => copyFile(join(FIXTURE_RAW, 'with-params.png'), join(dir, '043.png')));
    const text = problems.join('\n');
    expect(text).toMatch(/043\.png: image must be named <NNN>\.webp/);
    expect(text).toMatch(/043\.png: embedded metadata: PNG tEXt chunk/);
  });

  it('rejects a caption containing a link', async () => {
    const problems = await problemsAfter((dir) =>
      edit(join(dir, '008.md'), (t) => `${t.trimEnd()} See [the post](https://example.com).\n`),
    );
    expect(problems.join('\n')).toMatch(/008\.md: caption contains a link/);
  });

  it('rejects empty framing text (V18)', async () => {
    const problems = await problemsAfter((_dir, siteDir) => writeFile(join(siteDir, 'intro.md'), '\n'));
    expect(problems.join('\n')).toMatch(/intro\.md: empty/);
  });

  it('rejects a tombstone that still has an image', async () => {
    const problems = await problemsAfter((dir) => copyFile(join(dir, '001.webp'), join(dir, '042.webp')));
    expect(problems.join('\n')).toMatch(/042\.webp: unpublished exhibit still has an image file/);
  });

  it('exits non-zero from the command line on a violation', async () => {
    const { dir } = await tempFixtures();
    await edit(join(dir, '009.md'), (t) => t.replace('status:', 'author: "someone"\nstatus:'));
    await expect(run('node', ['scripts/verify-exhibits.mjs'], { env: { ...process.env, EXHIBITS_DIR: dir } })).rejects.toMatchObject({
      code: 1,
    });
  });
});
