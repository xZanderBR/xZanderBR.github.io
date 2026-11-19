import { test, expect } from '@playwright/test';

// Every label in an architecture diagram fits inside its box, and the labels on the arrows
// stay clear of every box, in both the wide layout and the tall one for phones.
const pages = [
  '/work/rivals-toolkit/',
  '/work/licensing-platform/',
  '/work/aztec-list/',
  '/work/pourtocol/',
];

type Problem = string;

for (const width of [1280, 375]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const path of pages) {
      test(`${path} diagram text fits`, async ({ page }) => {
        await page.goto(path);
        const svg = page.locator('[data-diagram] svg:visible');
        await expect(svg).toHaveCount(1);
        const problems: Problem[] = await svg.evaluate(async (el) => {
          await document.fonts.ready;
          const out: string[] = [];
          const pad = 3;
          const view = (el as SVGSVGElement).viewBox.baseVal;
          const rects = [...el.querySelectorAll('g[data-node] rect')].map((r) =>
            (r as SVGGraphicsElement).getBBox(),
          );
          for (const node of el.querySelectorAll('g[data-node]')) {
            const r = (node.querySelector('rect') as SVGGraphicsElement).getBBox();
            for (const text of node.querySelectorAll('text')) {
              const t = (text as SVGGraphicsElement).getBBox();
              if (t.x < r.x + pad || t.x + t.width > r.x + r.width - pad)
                out.push(`"${text.textContent}" is wider than its box`);
            }
          }
          for (const label of el.querySelectorAll('text[data-edge-label]')) {
            const t = (label as SVGGraphicsElement).getBBox();
            if (t.x < view.x || t.x + t.width > view.x + view.width)
              out.push(`"${label.textContent}" runs off the diagram`);
            for (const r of rects) {
              const overlaps =
                t.x < r.x + r.width &&
                t.x + t.width > r.x &&
                t.y < r.y + r.height &&
                t.y + t.height > r.y;
              if (overlaps) out.push(`"${label.textContent}" overlaps a box`);
            }
          }
          return out;
        });
        expect(problems).toEqual([]);
      });
    }
  });
}
