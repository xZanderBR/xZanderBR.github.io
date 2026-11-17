import { expect, test } from 'vitest';
import { ogProps } from '@/lib/og-props';

const data = {
  title: 'Rivals Toolkit',
  summary: 'Rust and React mod manager with a UE5 asset editor',
  proof: { value: '24,000+', label: 'downloads' },
};

test('uses the live number when there is one', () => {
  expect(ogProps(data, '25,000+')).toEqual({
    title: 'Rivals Toolkit',
    subtitle: 'Rust and React mod manager with a UE5 asset editor',
    proof: '25,000+ downloads',
  });
});

test('falls back to the static proof value', () => {
  expect(ogProps(data).proof).toBe('24,000+ downloads');
});
