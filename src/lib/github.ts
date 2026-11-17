// Build-time GitHub data. Every function returns null instead of throwing, so a
// GitHub outage or rate limit never fails the build; pages fall back to static values.

const API = 'https://api.github.com';
const TIMEOUT_MS = 5000;

type Fetch = typeof fetch;
type Release = { assets?: { name: string; download_count: number }[] };

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'xzanderbr-site-build',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function nextLink(link: string | null): string | null {
  return link?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
}

function warn(what: string, err: unknown) {
  const reason = err instanceof Error ? err.message : String(err);
  console.warn(`[github] ${what} unavailable, using the fallback: ${reason}`);
}

async function getJson(url: string, fetchImpl: Fetch, signal: AbortSignal) {
  const res = await fetchImpl(url, { headers: headers(), signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return { body: (await res.json()) as unknown, link: res.headers.get('link') };
}

export async function getReleaseDownloads(
  repo: string,
  fetchImpl: Fetch = fetch,
): Promise<number | null> {
  try {
    const signal = AbortSignal.timeout(TIMEOUT_MS);
    let url: string | null = `${API}/repos/${repo}/releases?per_page=100`;
    let total = 0;
    while (url) {
      const { body, link } = await getJson(url, fetchImpl, signal);
      for (const release of body as Release[]) {
        for (const asset of release.assets ?? []) {
          if (!asset.name.endsWith('.sha256')) total += asset.download_count;
        }
      }
      url = nextLink(link);
    }
    return total;
  } catch (err) {
    warn(`release downloads for ${repo}`, err);
    return null;
  }
}

export async function getRepoPushedAt(
  repo: string,
  fetchImpl: Fetch = fetch,
): Promise<string | null> {
  try {
    const { body } = await getJson(
      `${API}/repos/${repo}`,
      fetchImpl,
      AbortSignal.timeout(TIMEOUT_MS),
    );
    const pushedAt = (body as { pushed_at?: string }).pushed_at;
    if (!pushedAt) throw new Error('no pushed_at in response');
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(pushedAt));
  } catch (err) {
    warn(`last update for ${repo}`, err);
    return null;
  }
}

// Pages call these: one request per repo per build.
const cache = new Map<string, Promise<unknown>>();
function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

export const cachedReleaseDownloads = (repo: string) =>
  once(`downloads:${repo}`, () => getReleaseDownloads(repo));
export const cachedRepoPushedAt = (repo: string) =>
  once(`pushed:${repo}`, () => getRepoPushedAt(repo));

// "https://github.com/owner/name" -> "owner/name"
export function repoFromUrl(href: string): string | null {
  const m = href.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)\/?$/);
  return m?.[1] ?? null;
}
