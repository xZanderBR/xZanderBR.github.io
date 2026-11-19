import { test, expect } from '@playwright/test';

const slugs = ['rivals-toolkit', 'struc-ai', 'licensing-platform', 'aztec-list', 'pourtocol'];

test.describe('sharp screenshots', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const slug of slugs) {
    test(`${slug} offers each screenshot at full size and never stretches it`, async ({ page }) => {
      await page.goto(`/work/${slug}/`);
      for (const picture of await page.locator('article picture').all()) {
        const img = picture.locator('img');
        const source = Number(await img.getAttribute('width'));
        const candidates = await picture.locator('source').evaluateAll((els) =>
          els.flatMap((s) =>
            (s.getAttribute('srcset') ?? '')
              .split(',')
              .map((c) => Number(c.trim().split(' ')[1]?.replace('w', '')))
              .filter(Boolean),
          ),
        );
        expect(Math.max(...candidates)).toBeGreaterThanOrEqual(Math.min(source, 2400));
        const shown = await img.evaluate((el) => el.getBoundingClientRect().width);
        expect(shown).toBeLessThanOrEqual(source + 1);
      }
    });
  }
});
