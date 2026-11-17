import { expect, test } from 'vitest';
import { resumeProblems } from '@/lib/resume-check';

test('a one-page resume without a phone number passes', () => {
  expect(
    resumeProblems({ pages: 1, text: 'Zander Barajas | San Diego, CA | github.com/xZanderBR' }),
  ).toEqual([]);
});

test('flags a phone number, more than one page, and held-back claims', () => {
  expect(
    resumeProblems({ pages: 2, text: 'Call (555) 555-0100. A multi-product platform.' }),
  ).toEqual(['has 2 pages, expected 1', 'contains a phone number', 'contains "multi-product"']);
});

test('catches dashed phone numbers too', () => {
  expect(resumeProblems({ pages: 1, text: 'San Diego, CA | 555-555-0100 |' })).toEqual([
    'contains a phone number',
  ]);
});
