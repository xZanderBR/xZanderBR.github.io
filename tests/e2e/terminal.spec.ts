import { test, expect } from '@playwright/test';
import { profile } from '../../src/data/profile';

const slugs = ['rivals-toolkit', 'struc-ai', 'licensing-platform', 'aztec-list', 'pourtocol'];

test.describe('the terminal theme', () => {
  test.use({ colorScheme: 'light' });

  test('is dark and monospace even when the system prefers light', async ({ page }) => {
    for (const path of ['/', '/work/aztec-list/']) {
      await page.goto(path);
      const { bg, font } = await page.evaluate(() => ({
        bg: getComputedStyle(document.body).backgroundColor,
        font: getComputedStyle(document.body).fontFamily,
      }));
      expect(bg).toBe('rgb(13, 17, 23)');
      expect(font).toMatch(/JetBrains Mono/);
    }
  });

  test('has no theme toggle', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /theme|dark|light/i })).toHaveCount(0);
  });
});

test.describe('home page', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('opens with the headline in two tones, three buttons and the neofetch card', async ({
    page,
  }) => {
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveText(profile.hero);
    const tones = await h1
      .locator('span')
      .evaluateAll((spans) => spans.map((s) => getComputedStyle(s).color));
    expect(new Set(tones).size).toBe(2);
    expect(tones.at(-1)).toBe('rgb(79, 182, 216)');

    const hero = page.locator('[data-hero-actions]');
    await expect(hero.getByRole('link', { name: './see-work' })).toHaveAttribute('href', '#work');
    await expect(hero.getByRole('link', { name: 'resume.pdf' })).toHaveAttribute(
      'href',
      profile.resumeHref,
    );
    await expect(hero.getByRole('link', { name: /github/ })).toHaveAttribute(
      'href',
      /github\.com\/xZanderBR$/,
    );

    const card = page.locator('[data-neofetch]');
    for (const key of ['Role', 'Edu', 'Stack', 'Shipped'])
      await expect(card).toContainText(`${key}:`);
    await expect(card).toContainText(profile.education);
  });

  test('lists the work as cards: two columns, the odd last one full width', async ({ page }) => {
    await page.goto('/');
    const cards = page.getByTestId('project-card');
    await expect(cards).toHaveCount(slugs.length);
    const boxes = await cards.evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), w: Math.round(r.width) };
      }),
    );
    expect(boxes[0].x).toBe(boxes[2].x);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].w - 1);
    expect(boxes[4].w).toBeGreaterThan(boxes[0].w * 1.8);

    for (const [i, card] of (await cards.all()).entries()) {
      await expect(card).toHaveAttribute('href', `/work/${slugs[i]}/`);
      await expect(card.locator('[data-dir]')).toHaveText(`drwxr-xr-x ${slugs[i]}/`);
      await expect(card.locator('[data-proof]')).toHaveText(/^-> \S/);
      const tags = await card.locator('[data-tag]').count();
      expect(tags).toBeGreaterThanOrEqual(1);
      expect(tags).toBeLessThanOrEqual(3);
    }
    await expect(page.locator('[data-work-count]')).toHaveText(`${slugs.length} items`);
  });

  test('lists side projects as rows with a folder name and tools', async ({ page }) => {
    await page.goto('/');
    const rows = page.getByTestId('side-project');
    await expect(rows).toHaveCount(profile.otherProjects.length);
    for (const [i, row] of (await rows.all()).entries()) {
      await expect(row).toContainText(`${profile.otherProjects[i].dir}/`);
      await expect(row).toContainText(profile.otherProjects[i].stack.join(' · '));
    }
  });

  test('shows experience as a git log, newest first, with stable short hashes', async ({
    page,
  }) => {
    await page.goto('/');
    const commits = page.getByTestId('commit');
    await expect(commits).toHaveCount(profile.experience.length);
    for (const [i, commit] of (await commits.all()).entries()) {
      await expect(commit.locator('[data-hash]')).toHaveText(/^[0-9a-f]{7}$/);
      await expect(commit).toContainText(profile.experience[i].title);
      await expect(commit).toContainText(profile.experience[i].summary);
    }
    await expect(commits.first()).toContainText('(HEAD -> main)');
    await expect(commits.nth(1)).not.toContainText('HEAD');
  });

  test('puts About beside the contact box, with four ways to reach out', async ({ page }) => {
    await page.goto('/');
    const about = await page.locator('#about').boundingBox();
    const contact = page.locator('[data-contact]');
    const box = await contact.boundingBox();
    expect(box!.x).toBeGreaterThan(about!.x + about!.width - 1);
    await expect(contact.getByRole('link')).toHaveText([
      'email',
      'github',
      'linkedin',
      'resume.pdf',
    ]);
  });

  test('names each section plainly for screen readers', async ({ page }) => {
    await page.goto('/');
    for (const name of ['Work', 'Side projects', 'Experience', 'About']) {
      await expect(page.getByRole('heading', { level: 2, name, exact: true })).toHaveCount(1);
    }
  });
});

test.describe('case studies', () => {
  test.use({ viewport: { width: 1280, height: 900 } });
  for (const slug of slugs) {
    test(`${slug} has the prompt breadcrumb, a framed visual and a details panel`, async ({
      page,
    }) => {
      await page.goto(`/work/${slug}/`);
      const crumb = page.locator('[data-breadcrumb]');
      await expect(crumb).toContainText(`cd ~/work/${slug}`);
      await expect(crumb.getByRole('link', { name: '~/work' })).toHaveAttribute('href', '/#work');
      await expect(page.locator('[data-hero] [data-chrome]')).toBeVisible();
      const sidebar = page.locator('[data-sidebar]');
      await expect(sidebar).toContainText('Role:');
      await expect(sidebar).toContainText('# sections');
    });
  }
});

test('the 404 page answers like a shell', async ({ page }) => {
  await page.goto('/pages/nope.html');
  await expect(page.locator('main')).toContainText('No such file or directory');
  await expect(page.getByRole('link', { name: /cd ~/ })).toHaveAttribute('href', '/');
});
