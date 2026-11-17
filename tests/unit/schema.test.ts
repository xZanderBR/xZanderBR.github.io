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
