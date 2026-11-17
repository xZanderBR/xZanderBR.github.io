import { z } from 'astro/zod';

export const projectSchema = z.object({
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
  links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
  order: z.number().int(),
});

export type ProjectData = z.infer<typeof projectSchema>;
