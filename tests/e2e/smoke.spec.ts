import { test, expect } from '@playwright/test';

test('home renders with the site title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Zander Barajas');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
