import type { APIRoute, GetStaticPaths } from 'astro';
import { profile } from '@/data/profile';
import { getSortedProjects } from '@/lib/projects';
import { renderOgPng, type OgInput } from '@/lib/og';

export const getStaticPaths = (async () => {
  const projects = await getSortedProjects();
  return [
    { params: { slug: 'home' }, props: { title: profile.name, subtitle: profile.hero } },
    ...projects.map(({ id, data }) => ({
      params: { slug: id },
      props: {
        title: data.title,
        subtitle: data.summary,
        proof: `${data.proof.value} ${data.proof.label}`,
      },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng(props as OgInput);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
