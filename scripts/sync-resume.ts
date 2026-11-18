// Copies the web resume PDF into public/ after checking it is safe to publish.
// Normally the Resume repo's workflow runs this and opens the site PR; run it by
// hand only to test a local build (default: ~/Documents/Resume/build/resume_web.pdf).
// Usage: bun scripts/sync-resume.ts [path-to-pdf]
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { extractText, getDocumentProxy } from 'unpdf';
import { resumeProblems } from '../src/lib/resume-check';
import { loadRules } from '../src/lib/copy-check';

const source = process.argv[2] ?? join(homedir(), 'Documents/Resume/build/resume_web.pdf');
if (!existsSync(source)) {
  console.error(`No PDF at ${source}. Build the web resume first.`);
  process.exit(1);
}

const pdf = await getDocumentProxy(new Uint8Array(readFileSync(source)));
const { totalPages, text } = await extractText(pdf, { mergePages: true });
// Private copy rules: the local list plus the COPY_RULES secret, same as the copy check.
const TERMS_FILE = 'docs/superpowers/forbidden-terms.txt';
const rules = loadRules([
  existsSync(TERMS_FILE) ? readFileSync(TERMS_FILE, 'utf8') : null,
  process.env.COPY_RULES,
]);
const problems = resumeProblems({ pages: totalPages, text }, rules);
if (problems.length) {
  console.error(`Not copying ${source}:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

for (const dest of ['public/resume.pdf', 'public/assets/resume.pdf']) copyFileSync(source, dest);
console.log(`Copied ${source} to public/resume.pdf and public/assets/resume.pdf`);
