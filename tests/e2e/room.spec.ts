import { expect, test } from '@playwright/test';

// Velvet room behaviours that need a real browser (specs/002-velvet-room-design, tasks T015).

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('the gallery wall (US1)', () => {
  test('failed thumbnails keep their frame, pillow and nameplate (FR-006, V5)', async ({ page }) => {
    await page.route(/\.(webp|jpe?g|png|avif)$/, (route) => route.abort());
    await page.goto('/');
    const cards = page.locator('.exhibit-card');
    await expect(cards).toHaveCount(12);
    for (let i = 0; i < 12; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.frame')).toBeVisible();
      await expect(card.locator('.pillow')).toBeVisible();
      await expect(card.locator('.card-title')).toBeVisible();
    }
  });

  test('the cordon never blocks clicks (FR-003, V3)', async ({ page }) => {
    await page.goto('/');

    // Every cordon ignores the pointer and holds nothing focusable.
    const offenders = await page.$$eval(
      '.cordon',
      (els) => els.filter((el) => getComputedStyle(el).pointerEvents !== 'none' || el.querySelector('a, button, input, select, textarea, [tabindex]')).length,
    );
    expect(offenders).toBe(0);
    await expect(page.locator('.cordon')).toHaveCount(12);

    // Clicking the middle of the first card's rope reaches the card link underneath it.
    const first = page.locator('.exhibit-card').first();
    await first.scrollIntoViewIfNeeded();
    const href = await first.locator('a').getAttribute('href');
    const box = await first.locator('.cordon svg').boundingBox();
    expect(box).not.toBeNull();
    const x = box!.x + box!.width / 2;
    const y = box!.y + box!.height / 2;
    const hit = await page.evaluate(
      ([px, py]) => {
        const el = document.elementFromPoint(px, py);
        return { inLink: Boolean(el?.closest('a')), inCordon: Boolean(el?.closest('.cordon')) };
      },
      [x, y],
    );
    expect(hit).toEqual({ inLink: true, inCordon: false });
    await page.mouse.click(x, y);
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });
});
