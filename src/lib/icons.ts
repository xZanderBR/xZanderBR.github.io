import { Resvg } from '@resvg/resvg-js';

// One source for every icon: a geometric "Z" drawn as a path (favicons can't load
// web fonts), white on the site's accent blue.
const ACCENT = '#2459c9';
const Z_PATH = 'M9 8.5h14v3.2L13.6 20.3H23v3.2H9v-3.2l9.4-8.6H9z';

export function iconSvg({ rounded }: { rounded: boolean }): string {
  // iOS rounds the Apple touch icon itself, so that one stays square.
  const corner = rounded ? ' rx="7"' : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32"${corner} fill="${ACCENT}"/>` +
    `<path d="${Z_PATH}" fill="#ffffff"/>` +
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
