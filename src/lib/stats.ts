// Snapshots of real numbers behind the charts, checked when the site builds.
import { z } from 'astro/zod';
import licensingRaw from '@/data/licensing-stats.json';
import strucaiRaw from '@/data/strucai-catches.json';

const count = z.number().int().nonnegative();

// Read from the license server's Cloudflare dashboard (Workers metrics, last 30 days).
// It holds counts only: no Worker, bucket or account names. To refresh it, see the README.
export const licensingStatsSchema = z
  .object({
    source: z.string(),
    capturedAt: z.iso.date(),
    total: z.strictObject({ requests: count, errors: count, cpuMsP50: z.number().positive() }),
    // Full days only; the partial first and last days of the window are left out.
    days: z.array(z.strictObject({ date: z.iso.date(), requests: count, errors: count })).min(7),
    // By the country of the Cloudflare data center that served the requests.
    countries: z.array(z.strictObject({ code: z.string().regex(/^[A-Z]{2}$/), requests: count })),
  })
  .strict();

export type LicensingStats = z.infer<typeof licensingStatsSchema>;
export const licensingStats: LicensingStats = licensingStatsSchema.parse(licensingRaw);

// From the Struc-AI archive score (tools/score_archive.py in that repo): totals only, grouped
// by the kind of check. No project, client or sheet names.
export const strucaiCatchesSchema = z
  .object({
    source: z.string(),
    capturedAt: z.iso.date(),
    categories: z
      .array(z.strictObject({ label: z.string().min(1), caught: count, total: count }))
      .min(1),
  })
  .strict();

export const strucaiCatches = strucaiCatchesSchema.parse(strucaiRaw);
