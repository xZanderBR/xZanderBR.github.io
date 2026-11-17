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
