import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/work/licensing-platform/', '/pages/nope.html'];

// One dark theme, whatever the system prefers.
for (const path of pages) {
  test(`${path} has no axe violations`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
  });
}

test('the open command palette has no axe violations', async ({ page, browserName }) => {
  // In CI, Firefox's page process crashes ("Page crashed") while axe scans the open
  // dialog; it never reproduces elsewhere. Chromium and WebKit scan the same markup,
  // and Firefox still runs every other palette test.
  test.skip(browserName === 'firefox', 'Firefox crashes during this axe scan in CI');
  await page.goto('/');
  await expect(page.locator('[data-palette-ready]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Search' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  // Let the open animation finish; mid fade-in, text is partly transparent.
  await dialog.evaluate((el) =>
    Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)),
  );
  const { violations } = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
});

test.describe('phone width', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  const caseStudies = [
    '/work/rivals-toolkit/',
    '/work/struc-ai/',
    '/work/licensing-platform/',
    '/work/aztec-list/',
    '/work/pourtocol/',
  ];
  for (const path of ['/', ...caseStudies]) {
    test(`${path} has no axe violations at 375px`, async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
    });
  }
});
