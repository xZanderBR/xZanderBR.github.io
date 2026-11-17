import { PHONE, findCopyViolations, type Rule } from './copy-check';

// Checks for the public resume PDF: one page, no phone number, and nothing the
// private copy rules hold back (passed in, so the rules never live in this repo).
export function resumeProblems(
  { pages, text }: { pages: number; text: string },
  rules: Rule[] = [],
): string[] {
  const problems: string[] = [];
  if (pages !== 1) problems.push(`has ${pages} pages, expected 1`);
  if (PHONE.test(text)) problems.push('contains a phone number');
  for (const v of findCopyViolations('resume.pdf', text, rules)) {
    if (!PHONE.test(v.match)) problems.push(`matches a private copy rule: ${v.match}`);
  }
  return problems;
}
