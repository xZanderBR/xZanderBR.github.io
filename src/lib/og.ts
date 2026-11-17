import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export type OgInput = {
  title: string;
  subtitle: string;
  proof?: string;
};

const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 72;
const BAR = 12;
const COLORS = {
  paper: '#fcfcfb',
  ink: '#16181d',
  muted: '#5b6170',
  rule: '#e6e8ec',
  accent: '#2459c9',
};

// satori needs TTF/OTF/WOFF (not WOFF2), so read the static Fontsource files.
const fontDir = join(process.cwd(), 'node_modules/@fontsource/hanken-grotesk/files');
let fonts:
  Promise<{ name: string; data: Buffer; weight: 400 | 600; style: 'normal' }[]> | undefined;
function loadFonts() {
  fonts ??= Promise.all(
    ([400, 600] as const).map(async (weight) => ({
      name: 'Hanken Grotesk',
      data: await readFile(join(fontDir, `hanken-grotesk-latin-${weight}-normal.woff`)),
      weight,
      style: 'normal' as const,
    })),
  );
  return fonts;
}

type Node = { type: string; props: { style?: Record<string, unknown>; children?: unknown } };
const el = (style: Record<string, unknown>, children?: unknown): Node => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
});

export async function renderOgSvg({ title, subtitle, proof }: OgInput): Promise<string> {
  const tree = el(
    {
      // satori sizes the root as content-box, so leave room for padding and the bar.
      width: WIDTH - PAD * 2,
      height: HEIGHT - PAD * 2 - BAR,
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: PAD,
      background: COLORS.paper,
      color: COLORS.ink,
      fontFamily: 'Hanken Grotesk',
      borderBottom: `${BAR}px solid ${COLORS.accent}`,
    },
    [
      el({ fontSize: 26, color: COLORS.muted }, 'xzanderbr.github.io'),
      el({ flexDirection: 'column', gap: 18 }, [
        el({ fontSize: 68, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.1 }, title),
        el({ fontSize: 30, color: COLORS.muted, lineHeight: 1.35, maxWidth: 960 }, subtitle),
      ]),
      el({ fontSize: 34, fontWeight: 600, color: COLORS.accent }, proof ?? ''),
    ],
  );
  return satori(tree as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: await loadFonts(),
  });
}

export async function renderOgPng(input: OgInput): Promise<Uint8Array> {
  const svg = await renderOgSvg(input);
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
}
