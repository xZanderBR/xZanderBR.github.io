import { test, expect, type Locator } from '@playwright/test';
import licensing from '../../src/data/licensing-stats.json' with { type: 'json' };
import strucai from '../../src/data/strucai-catches.json' with { type: 'json' };

const slugs = ['rivals-toolkit', 'struc-ai', 'licensing-platform', 'aztec-list', 'pourtocol'];
const fmt = (n: number) => n.toLocaleString('en-US');

// What a screen reader gets from a visual: image alt text, named images (charts), named
// controls and links, and visually hidden descriptions.
async function descriptions(hero: Locator): Promise<string[]> {
  return hero.evaluate((el) => {
    const out: string[] = [];
    el.querySelectorAll('img[alt]').forEach((i) => out.push(i.getAttribute('alt') ?? ''));
    el.querySelectorAll('[role="img"][aria-label]').forEach((i) =>
      out.push(i.getAttribute('aria-label') ?? ''),
    );
    el.querySelectorAll('.sr-only, button, a').forEach((i) => out.push(i.textContent ?? ''));
    return out.map((s) => s.trim()).filter(Boolean);
  });
}

for (const slug of slugs) {
  test(`${slug} has one visual under the title, described for screen readers`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const hero = page.locator('[data-hero]');
    await expect(hero).toHaveCount(1);
    await expect(hero).toBeVisible();
    expect(await descriptions(hero)).not.toEqual([]);
    // Every image has an alt attribute; screenshots in the body are described.
    for (const img of await page.locator('article img').all()) {
      expect(await img.getAttribute('alt')).not.toBeNull();
    }
    for (const img of await page.locator('article .case-prose img').all()) {
      expect(await img.getAttribute('alt')).toBeTruthy();
    }
  });
}

test('every home row has a thumbnail with a picture in it', async ({ page }) => {
  await page.goto('/');
  const rows = page.getByTestId('project-row');
  await expect(rows).toHaveCount(slugs.length);
  for (const row of await rows.all()) {
    await expect(row.locator('[data-thumb] :is(img, svg)')).toHaveCount(1);
  }
});

test.describe('clips', () => {
  test('play on their own when motion is fine, with a button to pause', async ({ page }) => {
    await page.goto('/work/aztec-list/');
    const video = page.locator('[data-hero] video');
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
    await page.locator('[data-hero]').getByRole('button', { name: /pause/i }).click();
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.locator('[data-hero]').getByRole('button', { name: /play/i }).click();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  });

  test('describe themselves to screen readers', async ({ page }) => {
    await page.goto('/work/aztec-list/');
    await expect(page.locator('[data-hero] .sr-only')).toContainText('shopping assistant');
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });
    test('stay paused on the poster, with a button to play', async ({ page }) => {
      await page.goto('/work/aztec-list/');
      const video = page.locator('[data-hero] video');
      await page.waitForTimeout(1000);
      expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
      await expect(
        page.locator('[data-hero]').getByRole('button', { name: /play/i }),
      ).toBeVisible();
    });
  });
});

test('the demo video loads nothing from YouTube until it is played', async ({ page }) => {
  const youtube: string[] = [];
  page.on('request', (req) => {
    if (/youtube|ytimg|googlevideo/.test(req.url())) youtube.push(req.url());
  });
  await page.goto('/work/pourtocol/');
  await page.waitForLoadState('networkidle');
  expect(youtube).toEqual([]);

  // Without JavaScript it is still a link to the video.
  const play = page.locator('[data-hero]').getByRole('link', { name: /play video/i });
  await expect(play).toHaveAttribute('href', /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
  await play.click();
  const frame = page.locator('[data-hero] iframe');
  await expect(frame).toHaveAttribute(
    'src',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}/,
  );
  await expect(frame).toHaveAttribute('title', /.+/);
  await expect(page).toHaveURL(/\/work\/pourtocol\/$/);
});

for (const slug of ['licensing-platform', 'struc-ai']) {
  test(`${slug} charts are labeled, with their numbers a click away`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    const charts = page.locator('[data-chart]');
    expect(await charts.count()).toBeGreaterThan(0);
    for (const chart of await charts.all()) {
      const img = chart.locator('[role="img"]');
      await expect(img).toHaveCount(1);
      await expect(img).toHaveAccessibleName(/.+/);
      const table = chart.locator('table');
      await expect(table).toBeHidden();
      await chart.getByText('Show the numbers').click();
      await expect(table).toBeVisible();
      expect(await table.locator('tr').count()).toBeGreaterThan(1);
    }
  });
}

test('the chart headers match the data', async ({ page }) => {
  const charted = licensing.days.reduce((a, d) => a + d.requests, 0);
  const errors = licensing.days.reduce((a, d) => a + d.errors, 0);
  await page.goto('/work/licensing-platform/');
  const requests = page.locator('[data-hero] [data-chart]');
  await expect(requests).toContainText(`${fmt(charted)} over ${licensing.days.length} days`);
  await expect(requests).toContainText(errors === 0 ? 'zero errors' : `${fmt(errors)} errors`);

  const caught = strucai.categories.reduce((a, c) => a + c.caught, 0);
  const total = strucai.categories.reduce((a, c) => a + c.total, 0);
  await page.goto('/work/struc-ai/');
  await expect(page.locator('[data-hero] [data-chart]')).toContainText(
    `${caught} of ${total} across ${strucai.projects} archived projects`,
  );
});

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
  await page
    .locator('[data-hero]')
    .getByRole('link', { name: /play video/i })
    .click();
  await expect(page.locator('[data-hero] iframe')).toHaveCount(1);
  expect(errors).toEqual([]);
});
