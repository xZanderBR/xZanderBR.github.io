import { expect, test } from 'vitest';
import { sortProjects } from '@/lib/projects';

test('sorts by order ascending without mutating the input', () => {
  const input = [{ data: { order: 3 } }, { data: { order: 1 } }];
  const sorted = sortProjects(input);
  expect(sorted.map((p) => p.data.order)).toEqual([1, 3]);
  expect(input.map((p) => p.data.order)).toEqual([3, 1]);
});
