import { test, expect } from '@playwright/test';

const pages = ['/'];

test.describe('narrow screens', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  for (const path of pages) {
    test(`${path} has no horizontal scroll at 375px`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
