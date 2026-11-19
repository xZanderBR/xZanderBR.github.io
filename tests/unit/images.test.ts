import { describe, expect, test } from 'vitest';
import { responsiveWidths } from '@/lib/images';

describe('responsiveWidths', () => {
  test('includes the full source width, so a screen that needs it can get it', () => {
    expect(responsiveWidths(1134)).toEqual([640, 960, 1134]);
  });

  test('stops at 2400 for large sources', () => {
    expect(responsiveWidths(2560)).toEqual([640, 960, 1280, 1600, 2000, 2400]);
  });

  test('offers a small source only at its own size', () => {
    expect(responsiveWidths(500)).toEqual([500]);
  });
});

describe('sourceName', () => {
  test('keeps the file name of a built or source image path', async () => {
    const { sourceName } = await import('@/lib/images');
    expect(sourceName('/_astro/asset-manager.BVuywGB7.webp')).toBe('asset-manager');
    expect(sourceName('/@fs/x/src/assets/projects/aztec-list/search.webp?origWidth=2560')).toBe(
      'search',
    );
    expect(sourceName('/media/aztec-list/assistant.mp4')).toBe('assistant');
  });
});
