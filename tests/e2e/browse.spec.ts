import { expect, test } from '@playwright/test';

test.describe('browse the exhibit floor (US1)', () => {
  test('page 1 shows 12 exhibits, newest first, and never auto-loads more (V1)', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('.exhibit-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.first().locator('a')).toHaveAttribute('href', '/exhibits/040/');

    await page.mouse.wheel(0, 20_000);
    await page.waitForTimeout(1_000);
    await expect(cards).toHaveCount(12);

    await page.getByRole('link', { name: 'Next' }).click();
    await expect(page).toHaveURL(/\/page\/2\/$/);
    await expect(cards).toHaveCount(12);

    await page.goto('/page/4/');
    await expect(cards).toHaveCount(4);
  });

  test('the introduction appears on page 1 only (V16)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.wall-text')).toContainText('LinkedIn');
    await page.goto('/page/2/');
    await expect(page.locator('.wall-text')).toHaveCount(0);
  });

  test('cards show the display title and nothing else (V10, US1 scenario 2)', async ({ page }) => {
    await page.goto('/page/2/');
    const custom = page.locator('.exhibit-card', { has: page.locator('a[href="/exhibits/017/"]') });
    await expect(custom).toHaveText('The Seventeenth Square');
    const numbered = page.locator('.exhibit-card', { has: page.locator('a[href="/exhibits/020/"]') });
    await expect(numbered).toHaveText('Exhibit No. 020');
    await expect(page.locator('.exhibit-card img').first()).toHaveAttribute('alt', /flat square/);
  });

  test('the About page exists and is linked from the footer', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-footer').getByRole('link', { name: 'About the collection' }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About the collection');
  });
});
