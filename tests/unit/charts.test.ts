import { describe, expect, test } from 'vitest';
import { niceScale, shadeStep, sparklinePath } from '@/lib/charts';

describe('niceScale', () => {
  test('rounds the top up to a clean step', () => {
    expect(niceScale(6360)).toEqual({ max: 8000, step: 2000 });
    expect(niceScale(95)).toEqual({ max: 100, step: 25 });
    expect(niceScale(31)).toEqual({ max: 40, step: 10 });
  });

  test('keeps a value that already sits on a step', () => {
    expect(niceScale(8000)).toEqual({ max: 8000, step: 2000 });
  });

  test('handles all zeros', () => {
    expect(niceScale(0)).toEqual({ max: 1, step: 1 });
  });
});

describe('sparklinePath', () => {
  test('draws one point per value, inside the box', () => {
    const d = sparklinePath([0, 5, 10], 80, 50, 4);
    expect(d).toBe('M4 46L40 25L76 4');
  });

  test('draws a flat line through the middle when every value is the same', () => {
    expect(sparklinePath([3, 3], 10, 10, 0)).toBe('M0 5L10 5');
  });
});

describe('shadeStep', () => {
  const steps = [100, 300, 1000, 10000];

  test('puts a value in the step at or below it', () => {
    expect(shadeStep(10, steps)).toBe(0);
    expect(shadeStep(100, steps)).toBe(1);
    expect(shadeStep(999, steps)).toBe(2);
    expect(shadeStep(58710, steps)).toBe(4);
  });
});
