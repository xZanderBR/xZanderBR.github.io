import { test, expect } from '@playwright/test';

test('the header Resume link loads the PDF with a single request', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-palette-ready]')).toHaveCount(1);
  let pdfRequests = 0;
  page.on('request', (req) => {
    if (new URL(req.url()).pathname === '/resume.pdf') pdfRequests++;
  });
  // Opening a PDF may start a download in headless browsers; either way, count requests.
  await page
    .getByRole('banner')
    .getByRole('link', { name: 'Resume' })
    .click()
    .catch(() => {});
  await page.waitForTimeout(1500);
  expect(pdfRequests).toBe(1);
});

test('every link to the resume skips the client router', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[href="/resume.pdf"]');
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('data-astro-reload', '');
    await expect(link).toHaveAttribute('data-astro-prefetch', 'false');
  }
});

test('the 404 page is not indexed and has no canonical URL', async ({ page }) => {
  await page.goto('/pages/nope.html');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('the palette opens without animating', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-palette-ready]')).toHaveCount(1);
    await page.getByRole('button', { name: 'Search' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === 'running').length,
    );
    expect(running).toBe(0);
  });
});

test('the favicon set is served and linked', async ({ page, request }) => {
  for (const [path, type] of [
    ['/favicon.svg', 'image/svg+xml'],
    ['/favicon.ico', 'icon'],
    ['/apple-touch-icon.png', 'image/png'],
  ] as const) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()['content-type'], path).toContain(type);
  }
  await page.goto('/');
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
    'href',
    '/favicon.svg',
  );
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute(
    'href',
    '/favicon.ico',
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-touch-icon.png',
  );
});
