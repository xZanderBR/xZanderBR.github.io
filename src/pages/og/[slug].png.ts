import type { APIRoute, GetStaticPaths } from 'astro';
import { profile } from '@/data/profile';
import { getSortedProjects } from '@/lib/projects';
import { renderOgPng, type OgInput } from '@/lib/og';
import { ogProps } from '@/lib/og-props';
import { cachedReleaseDownloads } from '@/lib/github';
import { formatCountFloor } from '@/lib/format';

export const getStaticPaths = (async () => {
  const projects = await getSortedProjects();
  return [
    { params: { slug: 'home' }, props: { title: profile.name, subtitle: profile.hero } },
    ...(await Promise.all(
      projects.map(async ({ id, data }) => {
        // Same live number as the home page row; the frontmatter value is the fallback.
        const downloads = data.liveDownloads
          ? await cachedReleaseDownloads(data.liveDownloads.repo)
          : null;
        const live = downloads !== null ? formatCountFloor(downloads) : undefined;
        return { params: { slug: id }, props: ogProps(data, live) };
      }),
    )),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng(props as OgInput);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
