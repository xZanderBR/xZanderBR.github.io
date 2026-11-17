// Prints the key Lighthouse numbers for each run, so a failed budget in CI shows why.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = '.lighthouseci';
const ms = (v: number) => `${Math.round(v)}ms`;
for (const f of readdirSync(dir).filter((f) => f.startsWith('lhr-') && f.endsWith('.json'))) {
  const r = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  const a = r.audits;
  console.log(
    [
      new URL(r.requestedUrl).pathname,
      `perf ${Math.round(r.categories.performance.score * 100)}`,
      `FCP ${ms(a['first-contentful-paint'].numericValue)}`,
      `LCP ${ms(a['largest-contentful-paint'].numericValue)}`,
      `TBT ${ms(a['total-blocking-time'].numericValue)}`,
      `CLS ${a['cumulative-layout-shift'].numericValue.toFixed(3)}`,
      `SI ${ms(a['speed-index'].numericValue)}`,
      `fetched ${r.fetchTime}`,
    ].join(' | '),
  );
  // What moved, when there was layout shift.
  const shifts = a['layout-shifts']?.details?.items ?? [];
  for (const item of shifts.slice(0, 5)) {
    const node = item.node ?? {};
    console.log(
      `  shift ${Number(item.score ?? 0).toFixed(3)} ${node.selector ?? ''} ${node.snippet ?? ''}`.slice(
        0,
        220,
      ),
    );
  }
}
