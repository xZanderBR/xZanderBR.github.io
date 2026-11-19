import { describe, expect, test } from 'vitest';
import { shortHash, splitHero } from '@/lib/terminal';

describe('splitHero', () => {
  test('splits at the first colon, keeping the colon with the lead', () => {
    expect(splitHero('From bytes to browsers: Rust tools: and more.')).toEqual({
      lead: 'From bytes to browsers:',
      rest: ' Rust tools: and more.',
    });
  });

  test('leaves a sentence without a colon whole', () => {
    expect(splitHero('Just one line.')).toEqual({ lead: 'Just one line.', rest: '' });
  });
});

describe('shortHash', () => {
  test('is seven hex characters', () => {
    expect(shortHash('Software Engineer Envision Engineering')).toMatch(/^[0-9a-f]{7}$/);
  });

  test('is the same every build, and differs between inputs', () => {
    expect(shortHash('a')).toBe(shortHash('a'));
    expect(shortHash('a')).not.toBe(shortHash('b'));
  });
});
