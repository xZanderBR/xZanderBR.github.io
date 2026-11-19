// Responsive image widths for a screenshot: the standard steps below its own width, plus
// the full width itself (up to 2400), so a screen that needs every pixel can get it.
const STEPS = [640, 960, 1280, 1600, 2000, 2400];
const MAX = 2400;

export function responsiveWidths(sourceWidth: number): number[] {
  const below = STEPS.filter((w) => w < sourceWidth);
  return sourceWidth <= MAX ? [...below, sourceWidth] : below;
}

// The file's own name from an image or media path, for window title bars:
// "/_astro/asset-manager.BVuywGB7.webp" becomes "asset-manager".
export function sourceName(path: string): string {
  return path.split('/').pop()!.split(/[.?]/)[0];
}
