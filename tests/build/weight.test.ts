import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIST, htmlPages } from './dist';

const BUDGET = 1.5 * 1024 * 1024; // R9: index first load ≤ 1.5 MB

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
    let total = (await stat(index.path)).size;
    for (const ref of refs) total += (await stat(join(DIST, ref))).size;
    expect(total).toBeLessThanOrEqual(BUDGET);
  });
});
