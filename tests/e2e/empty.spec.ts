import { expect, test } from '@playwright/test';

test('an empty gallery shows the empty state, not an error (V2)', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.getByText('The gallery is being installed')).toBeVisible();
  await expect(page.locator('.exhibit-card')).toHaveCount(0);
});
