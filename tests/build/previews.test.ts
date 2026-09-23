import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { inspectImage } from '../../src/lib/image-metadata';
import { COLLECTION_DESCRIPTION } from '../../src/lib/site';
import { DIST, htmlPages, meta, ORIGIN } from './dist';

const PLATFORMS = /linkedin|facebook|instagram|twitter|x\.com|tiktok|reddit|threads/i;

describe('link previews (V20, V21, FR-015)', async () => {
  const pages = await htmlPages();
  const exhibitPages = pages.filter((p) => /^\/exhibits\/\d+\/$/.test(p.route) && p.root.querySelector('.plaque'));
  const otherPages = pages.filter((p) => !exhibitPages.includes(p));

  it('found published exhibit pages', () => {
    expect(exhibitPages).toHaveLength(40);
  });

  for (const { route, root } of exhibitPages) {
    it(`${route} previews with its title and a clean JPEG`, async () => {
      expect(meta(root, 'og:title')).toBe(root.querySelector('h1')!.textContent.trim());
      expect(meta(root, 'og:description')).toBe(COLLECTION_DESCRIPTION);
      expect(meta(root, 'twitter:card')).toBe('summary_large_image');
      const image = meta(root, 'og:image')!;
      expect(image.startsWith(`${ORIGIN}/`)).toBe(true);
      expect(image).toMatch(/\.jpe?g$/);
      expect(await inspectImage(join(DIST, new URL(image).pathname))).toEqual([]);
    });
  }

  it('other pages preview without an image', () => {
    for (const { route, root } of otherPages) {
      expect(meta(root, 'og:image'), route).toBeUndefined();
      expect(meta(root, 'twitter:card'), route).toBe('summary');
    }
  });

  it('never names a platform in preview text (Principle III)', () => {
    for (const { route, root } of pages) {
      expect(meta(root, 'og:description') ?? '', route).not.toMatch(PLATFORMS);
      expect(meta(root, 'description') ?? '', route).not.toMatch(PLATFORMS);
    }
  });

  it('the unpublished page keeps nothing of the exhibit (V21)', () => {
    const tombstone = pages.find((p) => p.route === '/exhibits/042/')!;
    expect(tombstone).toBeDefined();
    expect(meta(tombstone.root, 'og:image')).toBeUndefined();
    expect(tombstone.root.querySelectorAll('main img')).toHaveLength(0);
    expect(tombstone.root.querySelectorAll('h1, h2, h3').map((h) => h.textContent.trim())).toEqual([
      'Exhibit No. 042 is no longer available.',
    ]);
  });
});
