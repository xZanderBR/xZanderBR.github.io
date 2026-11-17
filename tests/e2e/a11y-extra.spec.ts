import { test, expect } from '@playwright/test';

const diagramPages = [
  '/work/rivals-toolkit/',
  '/work/licensing-platform/',
  '/work/aztec-list/',
  '/work/pourtocol/',
];

test('the first Tab reaches a skip link that moves focus to the main content', async ({
  page,
  browserName,
}) => {
  test.skip(browserName === 'webkit', 'WebKit skips links on Tab unless the OS setting is on');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('CSS transitions are effectively off, including in the palette', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-palette-ready]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const durations = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((el) => getComputedStyle(el).transitionDuration.split(',').map(parseFloat))
        .flat(),
    );
    expect(Math.max(...durations)).toBeLessThan(0.001);
  });
});

test.describe('diagrams on phones', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  for (const path of diagramPages) {
    test(`${path} shows one tall diagram that fits the screen`, async ({ page }) => {
      await page.goto(path);
      const visible = page.locator('svg[role="img"]:visible');
      await expect(visible).toHaveCount(1);
      expect((await visible.getAttribute('viewBox'))?.split(' ')[2]).toBe('340');
      const overflow = await visible.evaluate((svg) => {
        const fig = svg.closest('figure')!;
        return fig.scrollWidth - fig.clientWidth;
      });
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('diagrams on desktop', () => {
  for (const path of diagramPages) {
    test(`${path} shows the wide diagram`, async ({ page }) => {
      await page.goto(path);
      const visible = page.locator('svg[role="img"]:visible');
      await expect(visible).toHaveCount(1);
      expect((await visible.getAttribute('viewBox'))?.split(' ')[2]).toBe('680');
    });
  }
});
