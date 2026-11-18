import { test, expect } from '@playwright/test';

const slugs = ['rivals-toolkit', 'struc-ai', 'licensing-platform', 'aztec-list', 'pourtocol'];

for (const slug of slugs) {
  test(`${slug} has one visual under the title, with alt text`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const hero = page.locator('[data-hero]');
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();
    for (const img of await hero.locator('img').all()) {
      expect(await img.getAttribute('alt')).toBeTruthy();
    }
    // Every image in the page body is described too.
    for (const img of await page.locator('article .case-prose img').all()) {
      expect(await img.getAttribute('alt')).toBeTruthy();
    }
  });
}

test('every home row has a thumbnail', async ({ page }) => {
  await page.goto('/');
  const rows = page.getByTestId('project-row');
  await expect(rows).toHaveCount(slugs.length);
  for (const row of await rows.all()) {
    await expect(row.locator('[data-thumb]')).toBeVisible();
  }
});

test.describe('clips', () => {
  test('play on their own when motion is fine', async ({ page }) => {
    await page.goto('/work/aztec-list/');
    const video = page.locator('[data-hero] video');
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('stay paused on the poster, with controls to play', async ({ page }) => {
      await page.goto('/work/aztec-list/');
      const video = page.locator('[data-hero] video');
      await page.waitForTimeout(1000);
      expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
      expect(await video.evaluate((v: HTMLVideoElement) => v.controls)).toBe(true);
    });
  });
});

test('the demo video loads nothing from YouTube until it is clicked', async ({ page }) => {
  const youtube: string[] = [];
  page.on('request', (req) => {
    if (/youtube|ytimg|googlevideo/.test(req.url())) youtube.push(req.url());
  });
  await page.goto('/work/pourtocol/');
  await page.waitForLoadState('networkidle');
  expect(youtube).toEqual([]);

  await page.locator('[data-hero]').getByRole('button', { name: /play/i }).click();
  const frame = page.locator('[data-hero] iframe');
  await expect(frame).toHaveAttribute(
    'src',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}/,
  );
  await expect(frame).toHaveAttribute('title', /.+/);
});

for (const slug of ['licensing-platform', 'struc-ai']) {
  test(`${slug} charts are labeled and have their numbers as a table`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const charts = page.locator('[data-chart]');
    expect(await charts.count()).toBeGreaterThan(0);
    for (const chart of await charts.all()) {
      const img = chart.locator('[role="img"]');
      await expect(img).toHaveCount(1);
      await expect(img).toHaveAccessibleName(/.+/);
      expect(await chart.locator('table tr').count()).toBeGreaterThan(1);
    }
  });
}

test('opening a project from the home page sets up its media, with no errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  await page.getByTestId('project-row').filter({ hasText: 'Aztec List' }).click();
  await expect(page).toHaveURL(/\/work\/aztec-list\/$/);
  const video = page.locator('[data-hero] video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  // Back home and into another project: its embed is set up too.
  await page.goBack();
  await page.getByTestId('project-row').filter({ hasText: 'Pourtocol' }).click();
  await expect(page.locator('[data-embed]')).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-hero]').getByRole('button', { name: /play/i }).click();
  await expect(page.locator('[data-hero] iframe')).toHaveCount(1);
  expect(errors).toEqual([]);
});
