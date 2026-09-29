import { expect, test, type Page } from '@playwright/test';

// The velvet room at every width from a small phone to a wide desktop (specs/002-velvet-room-design, tasks T029).

const WIDTHS = [320, 390, 768, 1024, 1280, 1440, 1920];
const PAGES = ['/', '/page/2/', '/exhibits/017/', '/exhibits/042/', '/about/', '/no-such-page/'];

async function noSidewaysScroll(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth, 'page is wider than the screen').toBeLessThanOrEqual(innerWidth);
}

test.describe('no sideways scrolling (FR-010, SC-002)', () => {
  for (const width of WIDTHS) {
    for (const path of PAGES) {
      test(`${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await noSidewaysScroll(page);
      });
    }
  }

  test('at 390px every pillow and its tassels lie inside its card', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    const outside = await page.$$eval('.exhibit-card', (cards) =>
      cards.filter((card) => {
        const c = card.getBoundingClientRect();
        const p = card.querySelector('.pillow')!.getBoundingClientRect();
        const tassel = 7; // px each tassel reaches past the pillow's end
        return p.left - tassel < c.left - 0.5 || p.right + tassel > c.right + 0.5;
      }).length,
    );
    expect(outside).toBe(0);
  });
});

test.describe('columns follow the breakpoints (research R5)', () => {
  // Cards on the first row share the same top edge.
  async function columns(page: Page): Promise<number> {
    return page.$$eval('.exhibit-card', (cards) => {
      const tops = cards.map((c) => Math.round(c.getBoundingClientRect().top + window.scrollY));
      return tops.filter((t) => t === tops[0]).length;
    });
  }
  for (const [width, expected] of [[390, 1], [700, 2], [960, 3], [1280, 4]] as const) {
    test(`${expected} column${expected > 1 ? 's' : ''} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      expect(await columns(page)).toBe(expected);
    });
  }
});

test.describe('the layout survives missing web fonts (FR-009)', () => {
  for (const width of [320, 1440]) {
    for (const path of ['/', '/exhibits/017/']) {
      test(`${path} at ${width}px with the fonts blocked`, async ({ page }) => {
        await page.route('**/*.woff2', (route) => route.abort());
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await noSidewaysScroll(page);
        // The fallback serif must still fit inside each brass nameplate.
        const clipped = await page.$$eval('.card-title', (els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).length);
        expect(clipped).toBe(0);
      });
    }
  }
});

test.describe('forced colours keep the framed parts visible (edge case)', () => {
  test('frames, nameplates and plaques have a border', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    for (const selector of ['.frame', '.card-title']) {
      const width = await page.locator(selector).first().evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
      expect(width, selector).toBeGreaterThan(0);
    }
    await page.goto('/exhibits/017/');
    for (const selector of ['.exhibit-image', '.plaque']) {
      const width = await page.locator(selector).first().evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
      expect(width, selector).toBeGreaterThan(0);
    }
  });
});
