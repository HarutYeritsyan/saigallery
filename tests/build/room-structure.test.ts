import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIST, htmlPages, ORIGIN, walk } from './dist';

// Velvet room structure checks on the fixture build (specs/002-velvet-room-design, contracts/page-structure.md).

/** Every stylesheet in the build: linked .css files plus inlined <style> blocks. */
async function builtCss(): Promise<{ file: string; css: string }[]> {
  const files = (await walk(DIST)).filter((f) => f.endsWith('.css'));
  const sheets = await Promise.all(files.map(async (file) => ({ file, css: await readFile(file, 'utf8') })));
  for (const { route, root } of await htmlPages()) {
    root.querySelectorAll('style').forEach((el, i) => sheets.push({ file: `${route} <style> #${i}`, css: el.textContent }));
  }
  return sheets;
}

describe('stylesheet (FR-008, FR-009, FR-012)', async () => {
  const sheets = await builtCss();
  const all = sheets.map((s) => s.css).join('\n');
  const fontFaces = [...all.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);

  it('declares the four self-hosted fonts with font-display: swap', () => {
    const expected = [
      'bodoni-moda-latin-500-normal',
      'eb-garamond-latin-400-normal',
      'eb-garamond-latin-600-normal',
      'eb-garamond-latin-400-italic',
    ];
    for (const name of expected) {
      const face = fontFaces.find((f) => f.includes(name));
      expect(face, `@font-face for ${name}`).toBeDefined();
      expect(face!, name).toMatch(/font-display\s*:\s*swap/);
    }
  });

  it('loads every font from the site itself, and the files exist in the build', async () => {
    for (const face of fontFaces) {
      for (const m of face.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
        const url = m[1];
        if (/^https?:/.test(url)) expect(url.startsWith(ORIGIN), url).toBe(true);
        const local = url.startsWith(ORIGIN) ? url.slice(ORIGIN.length) : url;
        expect(local.startsWith('/'), `${url} should be a site-relative path`).toBe(true);
        await expect(stat(join(DIST, local)), url).resolves.toBeTruthy();
      }
    }
  });

  it('has no @import and no url() to another origin', () => {
    expect(all).not.toMatch(/@import/);
    for (const m of all.matchAll(/url\(\s*["']?(https?:[^"')]+)/g)) expect(m[1].startsWith(ORIGIN), m[1]).toBe(true);
  });

  it('never animates or transitions anything (constitution Principle II)', () => {
    expect(all).not.toMatch(/@keyframes/);
    expect(all).not.toMatch(/(^|[;{\s])(animation|transition)[\w-]*\s*:/);
  });
});

describe('index cards (US1, FR-002, FR-003)', async () => {
  const pages = (await htmlPages()).filter((p) => p.route === '/' || p.route === '/page/2/');

  it('builds the index pages under test', () => {
    expect(pages.map((p) => p.route).sort()).toEqual(['/', '/page/2/']);
  });

  for (const { route, root, html } of pages) {
    it(`${route}: every card has a frame, a pillow, a nameplate and a decorative cordon`, () => {
      const cards = root.querySelectorAll('li.exhibit-card');
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        const link = card.querySelector('a')!;
        const label = card.querySelector('a')?.getAttribute('href') ?? 'card';

        const frames = link.querySelectorAll('.frame');
        expect(frames, `${label} frame`).toHaveLength(1);
        expect(frames[0].querySelector('img'), `${label} frame holds the image`).not.toBeNull();

        const pillows = link.querySelectorAll('.pillow');
        expect(pillows, `${label} pillow`).toHaveLength(1);
        expect(pillows[0].getAttribute('aria-hidden'), `${label} pillow is hidden from assistive tech`).toBe('true');

        const titles = link.querySelectorAll('.card-title');
        expect(titles, `${label} nameplate`).toHaveLength(1);
        // 001: a card's text is the display title and nothing else.
        expect(link.textContent.trim(), `${label} card text`).toBe(titles[0].textContent.trim());

        const cordons = card.querySelectorAll('.cordon');
        expect(cordons, `${label} cordon`).toHaveLength(1);
        const cordon = cordons[0];
        expect(cordon.parentNode, `${label} cordon sits beside the link, not inside it`).toBe(card);
        expect(link.querySelector('.cordon')).toBeNull();
        expect(cordon.getAttribute('aria-hidden'), `${label} cordon is hidden from assistive tech`).toBe('true');
        expect(cordon.textContent.trim(), `${label} cordon has no text`).toBe('');
        expect(cordon.querySelectorAll('svg[aria-hidden="true"]'), `${label} rope`).toHaveLength(1);
        expect(cordon.querySelectorAll('.post'), `${label} posts`).toHaveLength(2);
      }
    });

    it(`${route}: inline SVG carries no foreign namespace`, () => {
      for (const m of html.matchAll(/xmlns(?::\w+)?="([^"]+)"/g)) expect(m[1].startsWith('http://www.w3.org/'), m[1]).toBe(true);
    });
  }
});

describe('exhibit page (US2, FR-004, FR-005)', async () => {
  const page = (await htmlPages()).find((p) => p.route === '/exhibits/017/')!;

  it('frames the image on a pillow, with the cordon in front and a separate caption plaque', () => {
    const figure = page.root.querySelector('figure.exhibit-figure')!;
    expect(figure).not.toBeNull();
    // Order inside the figure: the mount (frame + pillow), then the cordon, then the caption.
    const kids = figure.children.map((el) => `${el.tagName.toLowerCase()}.${el.classList.value.join('.')}`);
    expect(kids).toEqual(['div.exhibit-mount', 'span.cordon', 'figcaption.plaque']);

    const mount = figure.querySelector('.exhibit-mount')!;
    const image = mount.querySelector('.exhibit-image')!;
    expect(image.querySelector('img')).not.toBeNull();
    expect(image.querySelector('.image-unavailable-notice')).not.toBeNull();
    expect(mount.querySelectorAll('.pillow[aria-hidden="true"]')).toHaveLength(1);

    const cordon = figure.querySelector('span.cordon')!;
    expect(cordon.getAttribute('aria-hidden')).toBe('true');
    expect(cordon.textContent.trim()).toBe('');
  });

  it('keeps 001\'s hooks: one plaque, caption apart from alt, the inline onerror, framing note and back link', () => {
    expect(page.root.querySelectorAll('.plaque')).toHaveLength(1);
    const img = page.root.querySelector('.exhibit-image img')!;
    const alt = img.getAttribute('alt')!;
    expect(alt.length).toBeGreaterThan(0);
    expect(img.getAttribute('onerror')).toContain('image-unavailable');
    expect(page.root.querySelector('.plaque')!.textContent).not.toContain(alt);
    expect(page.root.querySelector('.framing-note a')!.getAttribute('href')).toBe('/about/');
    expect(page.root.querySelector('.back-link a')).not.toBeNull();
    expect(page.root.querySelector('h1')!.textContent.trim().length).toBeGreaterThan(0);
  });
});

describe('supporting pages (US4, FR-001)', async () => {
  const pages = await htmlPages();
  for (const route of ['/about/', '/exhibits/042/', '/404.html']) {
    it(`${route} sits in the room without a frame, pillow or cordon`, () => {
      const { root } = pages.find((p) => p.route === route)!;
      expect(root.querySelector('h1')).not.toBeNull();
      expect(root.querySelector('.site-header .site-name')).not.toBeNull();
      expect(root.querySelector('.site-footer a[href="/about/"]')).not.toBeNull();
      expect(root.querySelectorAll('.frame, .pillow, .cordon')).toHaveLength(0);
    });
  }

  it('"no longer available" still has no image and keeps its message and link', () => {
    const { root } = pages.find((p) => p.route === '/exhibits/042/')!;
    expect(root.querySelectorAll('main img')).toHaveLength(0);
    expect(root.querySelector('main')!.textContent).toContain('Exhibit No. 042 is no longer available.');
    expect(root.querySelectorAll('main a[href="/"]')).toHaveLength(1);
  });
});
