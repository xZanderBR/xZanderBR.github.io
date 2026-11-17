// 24766 -> "24,000+". Below the step, the plain number.
export function formatCountFloor(n: number, step = 1000): string {
  if (n < step) return n.toLocaleString('en-US');
  return `${(Math.floor(n / step) * step).toLocaleString('en-US')}+`;
}
