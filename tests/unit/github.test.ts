import { afterEach, expect, test, vi } from 'vitest';
import { getReleaseDownloads, getRepoPushedAt } from '@/lib/github';

afterEach(() => vi.restoreAllMocks());

const page = (assets: object[], next?: string) =>
  new Response(JSON.stringify([{ assets }]), {
    status: 200,
    headers: next ? { link: `<${next}>; rel="next"` } : {},
  });

test('sums downloads across pages, skipping checksums', async () => {
  const f = vi
    .fn()
    .mockResolvedValueOnce(
      page(
        [
          { name: 'app.msi', download_count: 100 },
          { name: 'app.msi.sha256', download_count: 50 },
        ],
        'https://api.github.com/x?page=2',
      ),
    )
    .mockResolvedValueOnce(page([{ name: 'app.exe', download_count: 25 }]));
  expect(await getReleaseDownloads('o/r', f)).toBe(125);
  expect(f).toHaveBeenCalledTimes(2);
});

test('returns null on 403, rejection, and timeout', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  expect(
    await getReleaseDownloads('o/r', vi.fn().mockResolvedValue(new Response('', { status: 403 }))),
  ).toBeNull();
  expect(
    await getReleaseDownloads('o/r', vi.fn().mockRejectedValue(new Error('offline'))),
  ).toBeNull();
  const hang = vi.fn(
    (_u: string, init: RequestInit) =>
      new Promise<Response>((_, rej) =>
        init.signal?.addEventListener('abort', () => rej(init.signal?.reason)),
      ),
  );
  expect(await getReleaseDownloads('o/r', hang)).toBeNull();
}, 10000);

test('formats pushed_at as short month and year', async () => {
  const f = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ pushed_at: '2026-11-16T22:59:00Z' })));
  expect(await getRepoPushedAt('o/r', f)).toBe('Nov 2026');
});

test('pushed_at returns null on failure', async () => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  expect(
    await getRepoPushedAt('o/r', vi.fn().mockResolvedValue(new Response('', { status: 500 }))),
  ).toBeNull();
});

test('repoFromUrl reads owner and name from github links only', async () => {
  const { repoFromUrl } = await import('@/lib/github');
  expect(repoFromUrl('https://github.com/oZanderr/Rivals-Toolkit')).toBe('oZanderr/Rivals-Toolkit');
  expect(repoFromUrl('https://github.com/xZanderBR/Aztec-List/')).toBe('xZanderBR/Aztec-List');
  expect(repoFromUrl('https://azteclist.com')).toBeNull();
});
