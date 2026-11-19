import { expect, test } from 'vitest';
import { renderOgPng } from '@/lib/og';

test('renders a 1200 by 630 PNG', async () => {
  const png = await renderOgPng({ title: 'Aztec List', subtitle: 'x', proof: 'Live' });
  expect(Array.from(png.slice(0, 4))).toEqual([0x89, 0x50, 0x4e, 0x47]);
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  // IHDR width and height sit at bytes 16 and 20.
  expect(view.getUint32(16)).toBe(1200);
  expect(view.getUint32(20)).toBe(630);
}, 20000);

test('keeps the whole layout on the canvas', async () => {
  const { renderOgSvg } = await import('@/lib/og');
  const svg = await renderOgSvg({ title: 'Aztec List', subtitle: 'x', proof: 'Live' });
  // The root box must match the canvas; a larger root pushes the proof line off the image.
  const root = svg.match(/<rect x="0" y="0" width="(\d+)" height="(\d+)"/);
  expect(root?.slice(1, 3)).toEqual(['1200', '630']);
}, 20000);

test('uses the terminal style: dark background, cyan accent', async () => {
  const { renderOgSvg } = await import('@/lib/og');
  const svg = await renderOgSvg({
    title: 'Aztec List',
    subtitle: 'x',
    proof: 'Live',
    command: 'cd ~/work/aztec-list',
  });
  expect(svg).toContain('#0d1117');
  expect(svg).toContain('#4fb6d8');
}, 20000);
