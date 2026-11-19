import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export type OgInput = {
  title: string;
  subtitle: string;
  proof?: string;
  // The shell command on the top line, after the "$".
  command?: string;
};

const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 72;
const BAR = 12;
const COLORS = {
  paper: '#0d1117',
  ink: '#e6edf3',
  muted: '#8b949e',
  accent: '#4fb6d8',
};

// satori needs TTF/OTF/WOFF (not WOFF2), so read the static Fontsource files.
const fontDir = join(process.cwd(), 'node_modules/@fontsource/jetbrains-mono/files');
let fonts:
  Promise<{ name: string; data: Buffer; weight: 400 | 800; style: 'normal' }[]> | undefined;
function loadFonts() {
  fonts ??= Promise.all(
    ([400, 800] as const).map(async (weight) => ({
      name: 'JetBrains Mono',
      data: await readFile(join(fontDir, `jetbrains-mono-latin-${weight}-normal.woff`)),
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

export async function renderOgSvg({
  title,
  subtitle,
  proof,
  command = 'echo $HEADLINE',
}: OgInput): Promise<string> {
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
      fontFamily: 'JetBrains Mono',
      borderBottom: `${BAR}px solid ${COLORS.accent}`,
    },
    [
      el({ fontSize: 26, color: COLORS.muted, gap: 14 }, [
        el({ color: COLORS.accent }, '$'),
        el({}, command),
      ]),
      el({ flexDirection: 'column', gap: 18 }, [
        el({ fontSize: 60, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }, title),
        el({ fontSize: 28, color: COLORS.muted, lineHeight: 1.4, maxWidth: 1000 }, subtitle),
      ]),
      el({ fontSize: 30, fontWeight: 800, color: COLORS.accent }, proof ? `-> ${proof}` : ''),
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
