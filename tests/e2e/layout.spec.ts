import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/work/rivals-toolkit/',
  '/work/struc-ai/',
  '/work/licensing-platform/',
  '/work/aztec-list/',
  '/work/pourtocol/',
  '/pages/nope.html',
];

// A classic, space-taking scrollbar like Windows and Linux show. In the
// chromium-scrollbars project (no --hide-scrollbars) it takes 15px of the width.
const CLASSIC_SCROLLBAR =
  'html{scrollbar-width:auto!important;scrollbar-color:auto!important}' +
  '::-webkit-scrollbar{width:15px;height:15px}::-webkit-scrollbar-thumb{background:#999}';

for (const width of [375, 768, 1280, 1440, 1920]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 812 } });
    for (const path of pages) {
      test(`${path} has no horizontal scroll`, async ({ page }) => {
        await page.goto(path);
        await page.addStyleTag({ content: CLASSIC_SCROLLBAR });
        // Compare with the visible width (clientWidth), which excludes the scrollbar;
        // comparing with the window width would miss scrollbar-sized overflow.
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}
