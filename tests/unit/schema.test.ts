import { describe, expect, test } from 'vitest';
import { projectSchema } from '@/lib/schema';

const valid = {
  title: 'Aztec List',
  summary: 'Student marketplace with semantic search',
  proof: { value: 'Live', label: 'demo, no signup' },
  role: 'Primary contributor',
  team: '5-person team',
  dates: 'Sep 2025 to May 2026',
  stack: ['FastAPI'],
  order: 4,
};

describe('projectSchema', () => {
  test('accepts a valid project and defaults links', () => {
    expect(projectSchema.parse(valid).links).toEqual([]);
  });

  test('rejects a project without proof', () => {
    const { proof: _proof, ...rest } = valid;
    expect(() => projectSchema.parse(rest)).toThrow();
  });

  test('rejects a summary over 60 characters', () => {
    expect(() => projectSchema.parse({ ...valid, summary: 'x'.repeat(61) })).toThrow();
  });

  test('rejects a non-url link', () => {
    expect(() =>
      projectSchema.parse({ ...valid, links: [{ label: 'Repo', href: 'nope' }] }),
    ).toThrow();
  });
});

describe('projectSchema visuals', () => {
  const heroes = {
    image: { kind: 'image', src: 'search.webp', alt: 'Search results' },
    clip: { kind: 'clip', src: '/media/aztec-list/assistant.mp4', poster: 'a.webp', alt: 'Asking' },
    youtube: { kind: 'youtube', id: 'go4TOXk46Cg', poster: 'p.webp', title: 'Demo video' },
    chart: { kind: 'chart', chart: 'licensing-requests' },
  };

  for (const [name, hero] of Object.entries(heroes)) {
    test(`accepts a ${name} hero`, () => {
      expect(projectSchema.parse({ ...valid, hero }).hero).toEqual(hero);
    });
  }

  test.each([
    ['an image without alt text', { kind: 'image', src: 'a.webp', alt: '' }],
    ['a clip outside /media', { kind: 'clip', src: '/a.mp4', poster: 'a.webp', alt: 'x' }],
    [
      'a clip that is not an MP4',
      { kind: 'clip', src: '/media/a/b.gif', poster: 'a.webp', alt: 'x' },
    ],
    ['a malformed YouTube id', { kind: 'youtube', id: 'nope', poster: 'p.webp', title: 'x' }],
    ['an unknown chart', { kind: 'chart', chart: 'pie' }],
  ])('rejects %s', (_name, hero) => {
    expect(() => projectSchema.parse({ ...valid, hero })).toThrow();
  });
});

describe('projectSchema tags', () => {
  test('accepts one to three tags', () => {
    expect(projectSchema.parse({ ...valid, tags: ['Rust'] }).tags).toEqual(['Rust']);
    expect(projectSchema.parse({ ...valid, tags: ['A', 'B', 'C'] }).tags).toHaveLength(3);
  });

  test('rejects none or more than three', () => {
    expect(() => projectSchema.parse({ ...valid, tags: [] })).toThrow();
    expect(() => projectSchema.parse({ ...valid, tags: ['A', 'B', 'C', 'D'] })).toThrow();
  });
});
