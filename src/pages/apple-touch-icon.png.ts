import type { APIRoute } from 'astro';
import { renderIconPng } from '@/lib/icons';

export const GET: APIRoute = () =>
  new Response(new Uint8Array(renderIconPng(180, { rounded: false })), {
    headers: { 'Content-Type': 'image/png' },
  });
