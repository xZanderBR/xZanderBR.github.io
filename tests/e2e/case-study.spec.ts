import { test, expect } from '@playwright/test';

const slugs = ['rivals-toolkit', 'struc-ai', 'licensing-platform', 'aztec-list', 'pourtocol'];

for (const slug of slugs) {
  test(`${slug} renders title and meta`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('dl')).toContainText('Stack');
  });
}

// Struc-AI is an internal tool at Zander's employer, so its page stays an overview.
for (const slug of slugs.filter((s) => s !== 'struc-ai')) {
  test(`${slug} has an architecture diagram`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    // Two layouts exist (wide and tall); exactly one shows, with a title.
    const visible = page.locator('[data-diagram] svg[role="img"]:visible');
    await expect(visible).toHaveCount(1);
    await expect(visible.locator('title')).toHaveCount(1);
  });
}

test('struc-ai stays an overview: no diagram, design details, roadmap or code link', async ({
  page,
}) => {
  await page.goto('/work/struc-ai/');
  const headings = page.locator('article h2');
  await expect(headings).toHaveText(['The problem', 'What I built', 'Results']);
  // A chart of results is fine; a diagram of how it works is not.
  await expect(page.locator('[data-diagram]')).toHaveCount(0);
  await expect(page.locator('svg[role="img"]:not([data-chart] svg)')).toHaveCount(0);
  await expect(page.locator('article')).not.toContainText(/78 rules|USGS|quote check|554/i);
  await expect(page.locator('article')).toContainText('101 of 107');
  await expect(page.locator('dl')).toContainText('Claude API');
  await expect(page.locator('a[href*="struc-ai"]')).toHaveCount(0);
});

test('old URLs land on the 404 page with a way home', async ({ page }) => {
  const res = await page.goto('/pages/music.html');
  expect(res?.status()).toBe(404);
  await page.getByRole('link', { name: /home/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
