import { test, expect } from '@playwright/test';

const slugs = ['rivals-toolkit', 'struc-ai', 'licensing-platform', 'aztec-list', 'pourtocol'];

for (const slug of slugs) {
  test(`${slug} renders title, meta and diagram`, async ({ page }) => {
    await page.goto(`/work/${slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('dl')).toContainText('Stack');
    await expect(page.locator('svg[role="img"] title')).toHaveCount(1);
  });
}

test('struc-ai has no roadmap and no code link', async ({ page }) => {
  await page.goto('/work/struc-ai/');
  await expect(page.getByRole('heading', { name: "What's next" })).toHaveCount(0);
  await expect(page.locator('a[href*="struc-ai"]')).toHaveCount(0);
});

test('old URLs land on the 404 page with a way home', async ({ page }) => {
  const res = await page.goto('/pages/music.html');
  expect(res?.status()).toBe(404);
  await page.getByRole('link', { name: /home/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
