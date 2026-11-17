// Checks for the public resume PDF: one page, no phone number, and none of the
// claims the resume notes hold back until they're confirmed.
const PHONE = /\(?\b\d{3}\)?[-. ]\d{3}-\d{4}\b/;
const HELD_BACK = ['multi-product'];

export function resumeProblems({ pages, text }: { pages: number; text: string }): string[] {
  const problems: string[] = [];
  if (pages !== 1) problems.push(`has ${pages} pages, expected 1`);
  if (PHONE.test(text)) problems.push('contains a phone number');
  for (const phrase of HELD_BACK) {
    if (text.toLowerCase().includes(phrase)) problems.push(`contains "${phrase}"`);
  }
  return problems;
}
