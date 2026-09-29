import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIST, htmlPages } from './dist';

const BUDGET = 1.5 * 1024 * 1024; // R9: index first load ≤ 1.5 MB

// Note: the fixture images are about 1 KB each (as are the site's current exhibits), so today this
// mostly measures HTML, CSS and fonts. The budget starts to bite once real photographs arrive
// (specs/002-velvet-room-design/research.md, R11).

/** Site-relative files that a stylesheet loads through url(), such as the self-hosted fonts. */
function cssAssets(css: string): string[] {
  const out: string[] = [];
  for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (m[1].startsWith('/')) out.push(m[1]);
  }
  return out;
}

describe('page weight (R9)', () => {
  it('index page 1 plus everything it references stays within budget', async () => {
    const index = (await htmlPages()).find((p) => p.route === '/')!;
    const refs = new Set<string>();
    for (const el of index.root.querySelectorAll('img, link[rel="stylesheet"]')) {
      const src = el.getAttribute('src') ?? el.getAttribute('href');
      if (src?.startsWith('/')) refs.add(src);
      // Count the largest srcset candidate, the worst case a browser would fetch.
      const srcset = el.getAttribute('srcset');
      if (srcset) refs.add(srcset.split(',').at(-1)!.trim().split(' ')[0]);
    }
    // Files that stylesheets load (fonts), whether Astro links the CSS or inlines it in a <style>.
    const sheets: string[] = index.root.querySelectorAll('style').map((el) => el.textContent);
    for (const el of index.root.querySelectorAll('link[rel="stylesheet"]')) {
      const href = el.getAttribute('href');
      if (href?.startsWith('/')) sheets.push(await readFile(join(DIST, href), 'utf8'));
    }
    for (const css of sheets) for (const asset of cssAssets(css)) refs.add(asset);

    let total = (await stat(index.path)).size;
    for (const ref of refs) total += (await stat(join(DIST, ref))).size;
    expect(total).toBeLessThanOrEqual(BUDGET);
  });
});
