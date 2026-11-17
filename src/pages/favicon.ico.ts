import type { APIRoute } from 'astro';
import { renderIconPng, toIco } from '@/lib/icons';

export const GET: APIRoute = () =>
  new Response(new Uint8Array(toIco(renderIconPng(32, { rounded: true }), 32)), {
    headers: { 'Content-Type': 'image/x-icon' },
  });
