import { expect, test } from 'vitest';
import { iconSvg, renderIconPng, toIco } from '@/lib/icons';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const size = (png: Uint8Array) => {
  const v = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return [v.getUint32(16), v.getUint32(20)];
};

test('the icon is an SVG drawn with a path, not text, in the accent blue', () => {
  const svg = iconSvg({ rounded: true });
  expect(svg).toMatch(/^<svg[^>]+viewBox="0 0 32 32"/);
  expect(svg).toContain('#2459c9');
  expect(svg).toContain('<path');
  expect(svg).not.toContain('<text');
});

test('the Apple touch icon is square, the tab icon is rounded', () => {
  expect(iconSvg({ rounded: false })).not.toContain('rx=');
  expect(iconSvg({ rounded: true })).toContain('rx=');
});

test('renders a PNG at the requested size', () => {
  const png = renderIconPng(180, { rounded: false });
  expect(Array.from(png.slice(0, 4))).toEqual(PNG_SIGNATURE);
  expect(size(png)).toEqual([180, 180]);
});

test('wraps a 32px PNG in a valid ICO file', () => {
  const png = renderIconPng(32, { rounded: true });
  const ico = toIco(png, 32);
  const v = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
  expect([v.getUint16(0, true), v.getUint16(2, true), v.getUint16(4, true)]).toEqual([0, 1, 1]);
  expect([ico[6], ico[7]]).toEqual([32, 32]);
  expect(v.getUint32(14, true)).toBe(png.length);
  expect(v.getUint32(18, true)).toBe(22);
  expect(Array.from(ico.slice(22, 26))).toEqual(PNG_SIGNATURE);
});
