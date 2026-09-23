import { describe, expect, it } from 'vitest';
import { htmlPages, ORIGIN } from './dist';

const ENGAGEMENT = /\b(likes?|views?|shares?|report|dispute|removal request)\b/i;

describe('site-wide guarantees', async () => {
  const pages = await htmlPages();

  it('built the expected pages', () => {
    const routes = pages.map((p) => p.route);
    expect(routes).toEqual(expect.arrayContaining(['/', '/page/2/', '/page/4/', '/about/', '/exhibits/017/', '/404.html']));
    expect(routes).not.toContain('/page/5/');
    expect(routes).not.toContain('/exhibits/041/');
  });

  for (const { route, root } of pages) {
    describe(route, () => {
      it('links to the About page (V17)', () => {
        expect(root.querySelector('a[href="/about/"]')).not.toBeNull();
      });

      it('has no forms, inputs or engagement wording (V11)', () => {
        expect(root.querySelectorAll('form, input, textarea, select, button')).toHaveLength(0);
        const copy = root.querySelector('body')!.clone() as typeof root;
        copy.querySelectorAll('.plaque').forEach((el) => el.remove());
        expect(copy.textContent).not.toMatch(ENGAGEMENT);
      });

      it('loads nothing from other origins and ships no script elements (R8)', () => {
        expect(root.querySelectorAll('script')).toHaveLength(0);
        for (const el of root.querySelectorAll('[src], link[href]')) {
          const url = el.getAttribute('src') ?? el.getAttribute('href')!;
          if (/^https?:/.test(url)) expect(url.startsWith(ORIGIN)).toBe(true);
        }
      });

      it('is indexable (FR-015)', () => {
        expect(root.toString()).not.toMatch(/noindex/i);
      });
    });
  }
});
