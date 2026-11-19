import { z } from 'astro/zod';

// Charts drawn at build time from the data in src/data/, by key.
export const HERO_CHARTS = ['licensing-requests', 'strucai-catches'] as const;

// `image` is Astro's image() helper in the content collection, which turns a relative path
// into image metadata. Tests pass a plain string schema instead.
export function projectSchemaWith<I extends z.ZodType>(image: () => I) {
  const alt = z.string().min(1);
  // The wide visual under the title on a case study page.
  const hero = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('image'), src: image(), alt }),
    z.object({
      kind: z.literal('clip'),
      // Clips are served as-is from public/media/<slug>/.
      src: z.string().regex(/^\/media\/[\w-]+\/[\w-]+\.mp4$/),
      poster: image(),
      alt,
    }),
    z.object({
      kind: z.literal('youtube'),
      id: z.string().regex(/^[\w-]{11}$/),
      poster: image(),
      title: alt,
    }),
    z.object({ kind: z.literal('chart'), chart: z.enum(HERO_CHARTS) }),
  ]);

  return z.object({
    title: z.string(),
    // The one-line description on the home page row.
    summary: z.string().max(60),
    proof: z.object({ value: z.string(), label: z.string() }),
    // When set, the home row and case study show live release downloads for this repo.
    liveDownloads: z.object({ repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/) }).optional(),
    role: z.string(),
    team: z.string(),
    dates: z.string(),
    stack: z.array(z.string()).min(1),
    // The chips on the home page card; the first three stack items when left out.
    tags: z.array(z.string()).min(1).max(3).optional(),
    links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
    order: z.number().int(),
    hero: hero.optional(),
  });
}

export const projectSchema = projectSchemaWith(() => z.string());

// The text fields every page uses. Visuals are typed by the collection, since their images
// are image metadata there and plain strings here.
export type ProjectData = Omit<z.infer<typeof projectSchema>, 'hero'>;
