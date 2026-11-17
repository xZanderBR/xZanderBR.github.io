import { test, expect } from '@playwright/test';

const WINDOWS_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36';
const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 Safari/605.1.15';

test('follows a dark system setting by default', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('toggle choice persists across reload and client navigation', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.getByRole('button', { name: /switch to light theme/i }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.getByTestId('project-row').nth(3).click();
  await expect(page).toHaveURL(/aztec-list/);
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test.describe('Windows', () => {
  test.use({ userAgent: WINDOWS_UA });
  test('header shows Ctrl K', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-kbd="other"]')).toBeVisible();
    await expect(page.locator('[data-kbd="mac"]')).toBeHidden();
  });
});

test.describe('Mac', () => {
  test.use({ userAgent: MAC_UA });
  test('header shows the command key', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-kbd="mac"]')).toBeVisible();
    await expect(page.locator('[data-kbd="other"]')).toBeHidden();
  });
});
