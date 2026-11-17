import { test, expect } from '@playwright/test';
import { profile } from '../../src/data/profile';

const WINDOWS_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36';
const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/605.1.15 Safari/605.1.15';

// The palette hydrates when the browser is idle; wait for it before using shortcuts.
async function ready(page: import('@playwright/test').Page) {
  await page.goto('/');
  await expect(page.locator('[data-palette-ready]')).toHaveCount(1);
}

test.describe('Windows', () => {
  test.use({ userAgent: WINDOWS_UA });
  test('Ctrl+K opens the palette and Enter navigates', async ({ page }) => {
    await ready(page);
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.type('aztec');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/work\/aztec-list\/$/);
  });
});

test.describe('Mac', () => {
  test.use({ userAgent: MAC_UA });
  test('Cmd+K opens the palette', async ({ page }) => {
    await ready(page);
    await page.keyboard.press('Meta+k');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test('slash opens the palette, and typing slash inside it types', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('combobox');
  await page.keyboard.type('/k');
  await expect(input).toHaveValue('/k');
  await expect(dialog).toBeVisible();
});

test('Escape closes and returns focus to the trigger', async ({ page }) => {
  await ready(page);
  const trigger = page.getByRole('button', { name: 'Search' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('copy email puts the address on the clipboard', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only');
  test.skip(!profile.email, 'profile.email is not set yet');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page);
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('option', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toHaveText('Email copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
});
