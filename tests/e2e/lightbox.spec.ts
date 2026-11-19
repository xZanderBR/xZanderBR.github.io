import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Screenshots open larger in a viewer; clips, the YouTube embed and charts don't.
const withShots = ['/work/rivals-toolkit/', '/work/aztec-list/', '/work/pourtocol/'];
const shots = 'article picture:not([data-embed] picture)';

for (const path of withShots) {
  test(`${path} links every screenshot to its full-size file`, async ({ page, request }) => {
    await page.goto(path);
    const pictures = page.locator(shots);
    expect(await pictures.count()).toBeGreaterThan(0);
    for (const picture of await pictures.all()) {
      const link = picture.locator('xpath=ancestor::a[@data-lightbox]');
      await expect(link).toHaveCount(1);
      const href = (await link.getAttribute('href'))!;
      const res = await request.get(href);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toMatch(/^image\//);
      const source = Number(await picture.locator('img').getAttribute('width'));
      const full = await page.evaluate(async (src) => {
        const img = new Image();
        img.src = src;
        await img.decode();
        return img.naturalWidth;
      }, href);
      expect(full).toBe(source);
    }
    await expect(
      page.locator('[data-embed] a[data-lightbox], [data-chart] a[data-lightbox]'),
    ).toHaveCount(0);
    await expect(page.locator('a[data-lightbox] video')).toHaveCount(0);
  });
}

test.describe('the viewer', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('opens a screenshot at full size with its caption and file name', async ({ page }) => {
    await page.goto('/work/aztec-list/');
    const link = page.locator('[data-main] a[data-lightbox]').first();
    const alt = await link.locator('img').getAttribute('alt');
    await link.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const img = dialog.locator('img');
    await expect(img).toHaveAttribute('alt', alt!);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(2560);
    await expect(dialog).toContainText('search.png');
    await expect(dialog).toContainText('Smart search ranks listings');
    await expect(dialog.getByRole('link', { name: /open full size/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  test('closes with Esc, the close button or a click outside the image', async ({ page }) => {
    await page.goto('/work/rivals-toolkit/');
    const link = page.locator('[data-main] a[data-lightbox]').first();
    const dialog = page.getByRole('dialog');

    await link.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(link).toBeFocused();

    await link.click();
    await dialog.getByRole('button', { name: /close/ }).click();
    await expect(dialog).toBeHidden();

    await link.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
  });

  test('opens from the keyboard', async ({ page }) => {
    await page.goto('/work/rivals-toolkit/');
    await page.locator('[data-main] a[data-lightbox]').first().focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('leaves Cmd or Ctrl clicks to open the file in a new tab', async ({ page, context }) => {
    await page.goto('/work/rivals-toolkit/');
    const opened = context.waitForEvent('page');
    await page
      .locator('[data-main] a[data-lightbox]')
      .first()
      .click({ modifiers: ['ControlOrMeta'] });
    await (await opened).close();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('still works after opening the project from the home page', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('project-card').filter({ hasText: 'Pourtocol' }).click();
    await expect(page).toHaveURL(/\/work\/pourtocol\/$/);
    await page.locator('[data-main] a[data-lightbox]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('has no axe violations while open', async ({ page }) => {
    await page.goto('/work/rivals-toolkit/');
    await page.locator('[data-main] a[data-lightbox]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
  });
});

test.describe('the viewer on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('fits the screen', async ({ page }) => {
    await page.goto('/work/aztec-list/');
    await page.locator('[data-main] a[data-lightbox]').first().click();
    const img = page.getByRole('dialog').locator('img');
    await expect(img).toBeVisible();
    const box = await img.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('a screenshot still opens its full-size file', async ({ page }) => {
    await page.goto('/work/rivals-toolkit/');
    await page.locator('[data-main] a[data-lightbox]').first().click();
    await expect(page).toHaveURL(/\/_astro\/[\w.-]+\.webp$/);
  });
});

test('every link on a case study points somewhere, so search engines can follow it', async ({
  page,
}) => {
  for (const path of withShots) {
    await page.goto(path);
    await expect(page.locator('a:not([href])')).toHaveCount(0);
  }
});
