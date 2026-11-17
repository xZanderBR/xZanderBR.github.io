// Copies the web resume PDF into public/ after checking it is safe to publish.
// Usage: bun scripts/sync-resume.ts [path-to-pdf]
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { extractText, getDocumentProxy } from 'unpdf';
import { resumeProblems } from '../src/lib/resume-check';

const source = process.argv[2] ?? join(homedir(), 'Documents/Resume/resumes/resume_web.pdf');
if (!existsSync(source)) {
  console.error(`No PDF at ${source}. Build the web resume first.`);
  process.exit(1);
}

const pdf = await getDocumentProxy(new Uint8Array(readFileSync(source)));
const { totalPages, text } = await extractText(pdf, { mergePages: true });
const problems = resumeProblems({ pages: totalPages, text });
if (problems.length) {
  console.error(`Not copying ${source}:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

for (const dest of ['public/resume.pdf', 'public/assets/resume.pdf']) copyFileSync(source, dest);
console.log(`Copied ${source} to public/resume.pdf and public/assets/resume.pdf`);
