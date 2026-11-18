import { describe, expect, test } from 'vitest';
import raw from '@/data/licensing-stats.json';
import { licensingStats, licensingStatsSchema } from '@/lib/stats';

describe('licensing stats snapshot', () => {
  test('matches its schema, with nothing extra in it', () => {
    expect(() => licensingStatsSchema.parse(raw)).not.toThrow();
    expect(() => licensingStatsSchema.parse({ ...raw, scriptName: 'x' })).toThrow();
  });

  test('backs the "60+ countries" line', () => {
    expect(licensingStats.countries.length).toBeGreaterThanOrEqual(60);
  });

  test('adds up: requests by country equal the total', () => {
    const sum = licensingStats.countries.reduce((a, c) => a + c.requests, 0);
    expect(sum).toBe(licensingStats.total.requests);
  });

  test('has one entry per day, in order, with no gaps', () => {
    const dates = licensingStats.days.map((d) => Date.parse(d.date));
    for (let i = 1; i < dates.length; i++) expect(dates[i] - dates[i - 1]).toBe(86_400_000);
  });
});

describe('country lookup for the map', () => {
  test('knows every country in the snapshot, by map id or as too small to draw', async () => {
    const { ISO_NUMERIC, TOO_SMALL_FOR_MAP, countryName } = await import('@/lib/countries');
    for (const { code } of licensingStats.countries) {
      expect(code in ISO_NUMERIC || TOO_SMALL_FOR_MAP.includes(code)).toBe(true);
      expect(countryName(code)).not.toBe(code);
    }
  });

  test('every map id is a country on the map, under the expected name', async () => {
    const { ISO_NUMERIC } = await import('@/lib/countries');
    const world = (await import('world-atlas/countries-110m.json')).default as {
      objects: { countries: { geometries: { id: string; properties: { name: string } }[] } };
    };
    const names = new Map(world.objects.countries.geometries.map((g) => [g.id, g.properties.name]));
    expect(names.get(ISO_NUMERIC.US)).toBe('United States of America');
    expect(names.get(ISO_NUMERIC.TT)).toBe('Trinidad and Tobago');
    for (const id of Object.values(ISO_NUMERIC)) expect(names.has(id)).toBe(true);
  });
});

describe('Struc-AI catches by kind of check', () => {
  test('add up to the 101 of 107 the page claims', async () => {
    const { strucaiCatches } = await import('@/lib/stats');
    const caught = strucaiCatches.categories.reduce((a, c) => a + c.caught, 0);
    const total = strucaiCatches.categories.reduce((a, c) => a + c.total, 0);
    expect(`${caught} of ${total}`).toBe('101 of 107');
    for (const c of strucaiCatches.categories) expect(c.caught).toBeLessThanOrEqual(c.total);
  });
});
