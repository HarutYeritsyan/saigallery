import { expect, test } from '@playwright/test';

test('an empty gallery shows the empty state, not an error (V2)', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.getByText('The gallery is being installed')).toBeVisible();
  await expect(page.locator('.exhibit-card')).toHaveCount(0);
});

for (const width of [320, 390, 1440]) {
  test(`the empty gallery does not scroll sideways at ${width}px (velvet room, FR-010)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
}
