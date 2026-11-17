import { expect, test } from 'vitest';
import { findCopyViolations, parseTermsFile } from '@/lib/copy-check';

const EM = String.fromCharCode(0x2014);

test('flags em dashes with line numbers', () => {
  expect(findCopyViolations('a.mdx', `ok\nbad ${EM} here`, [])).toEqual([
    { path: 'a.mdx', line: 2, match: EM },
  ]);
});

test('scoped rules only apply to matching paths', () => {
  const rules = parseTermsFile('# c\nwork/licensing :: \\bgame\\b\n\\bsecretword\\b');
  expect(
    findCopyViolations('dist/work/licensing-platform/index.html', 'a game', rules),
  ).toHaveLength(1);
  expect(findCopyViolations('dist/work/rivals-toolkit/index.html', 'a game', rules)).toHaveLength(
    0,
  );
  expect(findCopyViolations('x.html', 'SecretWord', rules)).toHaveLength(1);
});

test('webhooks does not trip a hooks rule', () => {
  expect(findCopyViolations('x', 'Shopify webhooks', parseTermsFile('\\bhooks?\\b'))).toHaveLength(
    0,
  );
});

test('blank lines and comments are not rules', () => {
  expect(parseTermsFile('\n  \n# only a comment\n')).toEqual([]);
});

test('loadRules combines the local file and the CI secret, skipping missing ones', async () => {
  const { loadRules } = await import('@/lib/copy-check');
  const rules = loadRules([undefined, '\\bfirst\\b', null, '', 'work/x :: second']);
  expect(rules.map((r) => r.pattern.source)).toEqual(['\\bfirst\\b', 'second']);
  expect(rules[1].pathIncludes).toBe('work/x');
});

test.each([
  '619.555.0100',
  '619 555 0100',
  '(619) 555-0100',
  '6195550100',
  '+1 619-555-0100',
  '619-555-0100',
])('flags the phone number %s without any private rules', (phone) => {
  expect(findCopyViolations('x.html', `Call ${phone} today`, [])).toHaveLength(1);
});

test.each(['24,766 downloads', '101 of 107', 'Sep 2025 to May 2026', '2,500+ customers'])(
  'does not mistake %s for a phone number',
  (text) => {
    expect(findCopyViolations('x.html', text, [])).toEqual([]);
  },
);
