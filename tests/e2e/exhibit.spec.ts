import { expect, test } from '@playwright/test';

const ALT_017 = 'A flat square in shade 17 with a pale circle at its centre.';

test.describe('view a single exhibit (US2)', () => {
  test('shows title, image with alt, and a separate caption plaque (V3)', async ({ page }) => {
    await page.goto('/exhibits/017/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The Seventeenth Square');
    const image = page.locator('.exhibit-image img');
    await expect(image).toHaveAttribute('alt', ALT_017);
    const plaque = page.locator('.plaque');
    await expect(plaque).toContainText('Exhibit 017 is a square that insists on its own importance.');
    await expect(plaque).not.toContainText(ALT_017);
  });

  test('"Back to the gallery" returns to the page the visitor came from (V4)', async ({ page }) => {
    await page.goto('/page/3/');
    await page.locator('.exhibit-card a').first().click();
    await page.getByRole('link', { name: 'Back to the gallery' }).click();
    await expect(page).toHaveURL(/\/page\/3\/$/);
  });

  test('shows "Image unavailable" when the image fails to load (V13)', async ({ page }) => {
    await page.route(/\.(webp|jpe?g|png|avif)$/, (route) => route.abort());
    await page.goto('/exhibits/017/');
    await expect(page.getByText('Image unavailable')).toBeVisible();
    await expect(page.locator('.plaque')).toBeVisible();
  });

  test('offers no dispute control and shows the framing note (US2 scenarios 4 and 6)', async ({ page }) => {
    await page.goto('/exhibits/017/');
    await expect(page.getByText(/report|dispute|removal/i)).toHaveCount(0);
    const note = page.locator('.framing-note');
    await expect(note).toContainText('From a collection of real images found in public social media posts');
    await expect(note.locator('a')).toHaveAttribute('href', '/about/');
    await expect(note).not.toContainText(/linkedin/i);
  });

  test('an unpublished exhibit shows "no longer available" (FR-010)', async ({ page }) => {
    const response = await page.goto('/exhibits/042/');
    expect(response?.status()).toBe(200);
    await expect(page.getByText('Exhibit No. 042 is no longer available.')).toBeVisible();
    await expect(page.locator('main img')).toHaveCount(0);
    await expect(page.locator('main a[href="/"]')).toHaveCount(1);
  });

  test('a draft has no page (404)', async ({ page }) => {
    const response = await page.goto('/exhibits/041/');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('No exhibit hangs here')).toBeVisible();
  });
});
