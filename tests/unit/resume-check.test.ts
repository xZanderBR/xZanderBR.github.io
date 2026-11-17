import { expect, test } from 'vitest';
import { resumeProblems } from '@/lib/resume-check';
import { parseTermsFile } from '@/lib/copy-check';

test('a one-page resume without a phone number passes', () => {
  expect(
    resumeProblems({ pages: 1, text: 'Zander Barajas | San Diego, CA | github.com/xZanderBR' }),
  ).toEqual([]);
});

test('flags a phone number and more than one page', () => {
  expect(resumeProblems({ pages: 2, text: 'Call (555) 555-0100.' })).toEqual([
    'has 2 pages, expected 1',
    'contains a phone number',
  ]);
});

test('applies the private copy rules it is given', () => {
  const rules = parseTermsFile('\\bsecretword\\b');
  expect(resumeProblems({ pages: 1, text: 'A SecretWord platform.' }, rules)).toEqual([
    'matches a private copy rule: SecretWord',
  ]);
});
