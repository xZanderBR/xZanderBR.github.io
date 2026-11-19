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

test.describe('home page on a desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('uses the width: a wide page, big previews and a stack line on every project', async ({
    page,
  }) => {
    await page.goto('/');
    const main = await page.locator('main').boundingBox();
    expect(main!.width).toBeGreaterThanOrEqual(1100);
    const rows = page.getByTestId('project-row');
    for (const row of await rows.all()) {
      const thumb = await row.locator('[data-thumb]').boundingBox();
      // Big enough to read, small enough that rows stay close to the height of their text.
      expect(thumb!.width).toBeGreaterThanOrEqual(185);
      expect(thumb!.width).toBeLessThanOrEqual(200);
      await expect(row.locator('[data-stack]')).not.toBeEmpty();
      // Title, summary and stack line form one column beside the preview.
      const left = thumb!.x + thumb!.width;
      for (const part of ['[data-title]', '[data-summary]', '[data-stack]']) {
        const box = await row.locator(part).boundingBox();
        expect(box!.x).toBeGreaterThan(left);
        expect(box!.y).toBeLessThan(thumb!.y + thumb!.height);
      }
    }
  });

  test('keeps the hero sentence to two lines at 40px', async ({ page }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    const { size, lines } = await h1.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        size: parseFloat(style.fontSize),
        lines: Math.round(el.getBoundingClientRect().height / parseFloat(style.lineHeight)),
      };
    });
    expect(size).toBe(40);
    expect(lines).toBe(2);
  });

  test('puts Experience and About side by side', async ({ page }) => {
    await page.goto('/');
    const experience = await page.locator('#experience').boundingBox();
    const about = await page.locator('#about').boundingBox();
    expect(Math.abs(experience!.y - about!.y)).toBeLessThanOrEqual(4);
    expect(about!.x).toBeGreaterThan(experience!.x + experience!.width - 1);
  });
});

test.describe('case studies on a desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const slug of slugs) {
    test(`${slug} has a sticky sidebar, page links and evenly wide figures`, async ({ page }) => {
      await page.goto(`/work/${slug}/`);
      const sidebar = page.locator('[data-sidebar]');
      await expect(sidebar).toBeVisible();
      expect(await sidebar.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
      await expect(sidebar.locator('dl')).toContainText('Stack');
      const title = page.getByRole('heading', { level: 1 });
      expect(await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBe(44);

      const headingIds = await page
        .locator('[data-main] h2')
        .evaluateAll((hs) => hs.map((h) => h.id));
      const nav = page.getByRole('navigation', { name: 'On this page' });
      const targets = await nav
        .locator('a')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
      expect(targets).toEqual(headingIds.map((id) => `#${id}`));
      // A link scrolls its section to the top, or as far as a short page can go.
      await nav.locator('a').nth(1).click();
      const target = page.locator(`[id="${headingIds[1]}"]`);
      await expect
        .poll(async () => {
          const y = (await target.boundingBox())!.y;
          const atEnd = await page.evaluate(
            () => Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight,
          );
          return y < 200 || (atEnd && y < 900);
        })
        .toBe(true);

      const widths = await page
        .locator('[data-main] .case-prose > figure:visible')
        .evaluateAll((fs) => fs.map((f) => Math.round(f.getBoundingClientRect().width)));
      expect(new Set(widths).size).toBeLessThanOrEqual(1);
      const hero = await page.locator('[data-hero]').boundingBox();
      const column = await page.locator('[data-main]').boundingBox();
      expect(hero!.width).toBeGreaterThan(column!.width);
    });
  }
});

test.describe('case studies on a tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } });
  test('show the details under the visual, without the sidebar or page links', async ({ page }) => {
    await page.goto('/work/aztec-list/');
    await expect(page.locator('[data-sidebar] dl')).toBeVisible();
    expect(
      await page.locator('[data-sidebar]').evaluate((el) => getComputedStyle(el).position),
    ).not.toBe('sticky');
    await expect(page.getByRole('navigation', { name: 'On this page' })).toBeHidden();
    const hero = await page.locator('[data-hero]').boundingBox();
    const details = await page.locator('[data-sidebar]').boundingBox();
    expect(details!.y).toBeGreaterThan(hero!.y + hero!.height - 1);
  });
});
