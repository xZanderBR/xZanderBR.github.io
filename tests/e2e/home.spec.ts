import { test, expect } from '@playwright/test';
import { profile } from '../../src/data/profile';

const rows = [
  // Live from GitHub at build time, floored to the thousand.
  ['Rivals Toolkit', /\d{2,3},000\+/, '/work/rivals-toolkit/'],
  ['Struc-AI', '101 of 107', '/work/struc-ai/'],
  ['Licensing Platform', '2,500+', '/work/licensing-platform/'],
  ['Aztec List', 'Live', '/work/aztec-list/'],
  ['Pourtocol', '~80%', '/work/pourtocol/'],
] as const;

test('project cards appear in order with proof and links', async ({ page }) => {
  await page.goto('/');
  const r = page.getByTestId('project-card');
  await expect(r).toHaveCount(5);
  for (const [i, [name, proof, href]] of rows.entries()) {
    await expect(r.nth(i)).toContainText(name);
    await expect(r.nth(i)).toContainText(proof);
    await expect(r.nth(i)).toHaveAttribute('href', href);
  }
});

test('hero, experience, side projects and about render', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(profile.hero);
  await expect(page.locator('#experience')).toContainText('Envision Engineering');
  await expect(page.locator('#side-projects li')).toHaveCount(3);
  await expect(page.locator('#about')).toContainText('powerlifting');
});

test('resume link serves a PDF', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Resume' }).first()).toHaveAttribute(
    'href',
    '/resume.pdf',
  );
  for (const p of ['/resume.pdf', '/assets/resume.pdf']) {
    const res = await request.get(p);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('cards render and navigate', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('project-card').first().click();
    await expect(page).toHaveURL(/\/work\/rivals-toolkit\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rivals Toolkit');
  });
});
