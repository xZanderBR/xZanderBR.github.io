import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const playwright = String(pkg.devDependencies['@playwright/test']).replace(/^[\^~]/, '');

// CI runs inside Playwright's image, whose browsers must match the installed
// @playwright/test. If Dependabot bumps one, this fails until the other moves too.
test('CI uses the Playwright image that matches @playwright/test', () => {
  const image = ci.match(/mcr\.microsoft\.com\/playwright:v([\d.]+)-/)?.[1];
  expect(image).toBe(playwright);
});

test('CI never installs browsers or Linux packages itself', () => {
  expect(ci).not.toMatch(/playwright install/);
  expect(ci).not.toMatch(/apt-get/);
});
