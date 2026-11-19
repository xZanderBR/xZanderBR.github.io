import { Resvg } from '@resvg/resvg-js';
import { PIXEL_ROWS, pixelCells } from './pixel';

// One source for every icon: the neofetch logo's pixel Z, cyan on the terminal background,
// drawn as squares (favicons can't load web fonts).
const PAPER = '#0d1117';
const ACCENT = '#4fb6d8';
const CELL = 4;
const Z = pixelCells(PIXEL_ROWS.map((row) => row.slice(0, 5)));
// The Z is 5 by 6 cells: center it in the 32px square.
const OFFSET_X = (32 - 5 * CELL) / 2;
const OFFSET_Y = (32 - 6 * CELL) / 2;

export function iconSvg({ rounded }: { rounded: boolean }): string {
  // iOS rounds the Apple touch icon itself, so that one stays square.
  const corner = rounded ? ' rx="7"' : '';
  const pixels = Z.map(
    (p) =>
      `<rect x="${OFFSET_X + p.x * CELL}" y="${OFFSET_Y + p.y * CELL}" width="${CELL}" height="${CELL}"/>`,
  ).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">` +
    `<rect width="32" height="32"${corner} fill="${PAPER}"/>` +
    `<g fill="${ACCENT}">${pixels}</g>` +
    `</svg>`
  );
}

export function renderIconPng(size: number, opts: { rounded: boolean }): Uint8Array {
  return new Resvg(iconSvg(opts), { fitTo: { mode: 'width', value: size } }).render().asPng();
}

// An ICO file holding a single PNG image (supported by every current browser).
export function toIco(png: Uint8Array, size: number): Uint8Array {
  const header = new DataView(new ArrayBuffer(22));
  header.setUint16(0, 0, true); // reserved
  header.setUint16(2, 1, true); // type: icon
  header.setUint16(4, 1, true); // image count
  header.setUint8(6, size >= 256 ? 0 : size); // width
  header.setUint8(7, size >= 256 ? 0 : size); // height
  header.setUint8(8, 0); // palette size
  header.setUint8(9, 0); // reserved
  header.setUint16(10, 1, true); // color planes
  header.setUint16(12, 32, true); // bits per pixel
  header.setUint32(14, png.length, true); // image size
  header.setUint32(18, 22, true); // image offset
  const ico = new Uint8Array(22 + png.length);
  ico.set(new Uint8Array(header.buffer), 0);
  ico.set(png, 22);
  return ico;
}
