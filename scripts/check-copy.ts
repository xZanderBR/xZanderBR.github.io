// Fails when site copy contains an em dash, or any term from the private list in
// docs/superpowers/forbidden-terms.txt (local only; CI checks em dashes alone).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findCopyViolations, parseTermsFile } from '../src/lib/copy-check';

const TERMS_FILE = 'docs/superpowers/forbidden-terms.txt';

function files(dir: string, exts: string[], skip: string[] = []): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((f) => join(dir, f))
    .filter((f) => exts.some((e) => f.endsWith(e)) && !skip.some((s) => f.startsWith(s)));
}

const rules = existsSync(TERMS_FILE) ? parseTermsFile(readFileSync(TERMS_FILE, 'utf8')) : [];
const targets = [
  ...files('dist', ['.html']),
  ...files('src', ['.astro', '.mdx', '.ts', '.tsx'], ['src/components/ui/']),
];

if (!files('dist', ['.html']).length) {
  console.error('No built pages in dist/. Run the build first.');
  process.exit(1);
}

const violations = targets.flatMap((f) => findCopyViolations(f, readFileSync(f, 'utf8'), rules));
for (const v of violations) console.log(`${v.path}:${v.line}: ${v.match}`);
console.log(
  `Checked ${targets.length} files against ${rules.length + 1} rules: ${violations.length} problem(s).`,
);
process.exit(violations.length ? 1 : 0);
