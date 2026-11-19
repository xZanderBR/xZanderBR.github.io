// Small, pure helpers for the charts drawn at build time.

// A clean axis for values from 0 to `maxValue`: a step of 1, 2, 2.5 or 5 times a power of
// ten, and the first multiple of it at or above the largest value.
export function niceScale(maxValue: number, targetTicks = 4): { max: number; step: number } {
  if (maxValue <= 0) return { max: 1, step: 1 };
  const raw = maxValue / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) as number;
  return { max: Math.ceil(maxValue / step) * step, step };
}

const round = (n: number) => String(Math.round(n * 10) / 10);

// An SVG path through the values, scaled to fill a w by h box less `pad` on every side.
export function sparklinePath(values: number[], w: number, h: number, pad = 2): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const dx = values.length > 1 ? (w - 2 * pad) / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = pad + i * dx;
      const y = max === min ? h / 2 : pad + (1 - (v - min) / (max - min)) * (h - 2 * pad);
      return `${i === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`;
    })
    .join('');
}

// Which shade a value gets, given the ascending lower bounds of the darker shades:
// 0 is below the first bound, steps.length is at or above the last.
export function shadeStep(value: number, steps: number[]): number {
  return steps.filter((s) => value >= s).length;
}
