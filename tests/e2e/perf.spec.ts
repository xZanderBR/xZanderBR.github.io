import { test, expect, type Response } from '@playwright/test';

// The site is static content. Its JavaScript budget at load is the page router and
// two tiny controls; React and the palette load only when someone opens the palette.
const LOAD_BUDGET_BYTES = 30_000;

for (const path of ['/', '/work/aztec-list/']) {
  test(`${path} loads under ${LOAD_BUDGET_BYTES / 1000}KB of JavaScript before interaction`, async ({
    page,
  }) => {
    const sizes: Promise<number>[] = [];
    page.on('response', (res: Response) => {
      if (res.request().resourceType() === 'script') {
        sizes.push(res.body().then((b) => b.length));
      }
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // let idle-time loading kick in, if any
    const total = (await Promise.all(sizes)).reduce((a, b) => a + b, 0);
    expect(total).toBeLessThan(LOAD_BUDGET_BYTES);
  });
}

// On Linux and Windows the system fallback font is much wider than Hanken Grotesk, so
// text used to re-wrap when it arrived (0.057 on Linux). The preload and the
// metric-matched fallback keep that near zero. The layout-shift API is Chromium-only.
async function measureShift(
  page: import('@playwright/test').Page,
  path: string,
  fontDelayMs: number,
) {
  if (fontDelayMs) {
    await page.route(/\.woff2$/, async (route) => {
      await new Promise((r) => setTimeout(r, fontDelayMs));
      await route.continue();
    });
  }
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as {
        value: number;
        hadRecentInput: boolean;
      }[]) {
        if (!e.hadRecentInput) w.__cls += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(fontDelayMs + 700);
  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}

test.describe('font loading', () => {
  test.use({ viewport: { width: 412, height: 823 } });
  for (const path of ['/', '/work/aztec-list/']) {
    test(`${path} doesn't shift when the font loads`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'The layout-shift API is Chromium-only');
      expect(await measureShift(page, path, 0)).toBeLessThan(0.01);
    });
    test(`${path} barely shifts when the font is slow`, async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'The layout-shift API is Chromium-only');
      expect(await measureShift(page, path, 800)).toBeLessThan(0.03);
    });
  }
});

test('hovering or focusing Search starts loading the palette before any click', async ({
  page,
}) => {
  const paletteRequests: string[] = [];
  page.on('request', (req) => {
    if (/\/_astro\/mount\.[\w-]+\.js$/.test(new URL(req.url()).pathname)) {
      paletteRequests.push(req.url());
    }
  });
  await page.goto('/');
  await expect(page.locator('[data-palette-ready]')).toHaveCount(1);
  expect(paletteRequests).toHaveLength(0);
  await page.getByRole('button', { name: 'Search' }).hover();
  await expect.poll(() => paletteRequests.length).toBeGreaterThan(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

// Thumbnails are tiny, so the home page stays light even with five of them.
const HOME_IMAGE_BUDGET_BYTES = 120_000;

test(`/ loads under ${HOME_IMAGE_BUDGET_BYTES / 1000}KB of images`, async ({ page }) => {
  const sizes: Promise<number>[] = [];
  page.on('response', (res: Response) => {
    if (res.request().resourceType() === 'image') sizes.push(res.body().then((b) => b.length));
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const total = (await Promise.all(sizes)).reduce((a, b) => a + b, 0);
  expect(total).toBeLessThan(HOME_IMAGE_BUDGET_BYTES);
});

test('the visual under the title loads first; screenshots further down wait', async ({ page }) => {
  await page.goto('/work/pourtocol/');
  const hero = page.locator('[data-hero] img');
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  expect(await hero.getAttribute('loading')).not.toBe('lazy');
  for (const img of await page.locator('article .case-prose img').all()) {
    await expect(img).toHaveAttribute('loading', 'lazy');
  }
});
