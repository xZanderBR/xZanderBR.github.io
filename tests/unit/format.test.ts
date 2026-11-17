import { expect, test } from 'vitest';
import { formatCountFloor } from '@/lib/format';

test('floors to the step and adds a plus', () => {
  expect(formatCountFloor(24766)).toBe('24,000+');
  expect(formatCountFloor(2550, 500)).toBe('2,500+');
});

test('returns the plain number below the step', () => {
  expect(formatCountFloor(742)).toBe('742');
});
