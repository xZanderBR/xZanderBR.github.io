// The pixel "ZB" used by the neofetch logo and, its Z alone, by the site icon. One string per
// row; "#" is a filled pixel. Z is the first five columns, B the last five.
export const PIXEL_ROWS = [
  '#####.####.',
  '....#.#...#',
  '...#..####.',
  '..#...#...#',
  '.#....#...#',
  '#####.####.',
];

export function pixelCells(rows: string[]): { x: number; y: number }[] {
  return rows.flatMap((row, y) => [...row].flatMap((c, x) => (c === '#' ? [{ x, y }] : [])));
}
