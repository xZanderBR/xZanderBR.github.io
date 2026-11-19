// Captures Aztec List screenshots and the assistant clip from the live demo.
// Raw files go to media-src/aztec-list/ (gitignored); scripts/capture/optimize.sh turns them
// into the WebP and MP4 files the site uses.
// Usage: bun scripts/capture/aztec-list.ts
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Page } from '@playwright/test';

const SITE = 'https://azteclist.com';
const OUT = 'media-src/aztec-list';
const VIEWPORT = { width: 1280, height: 800 };
// Pick these to suit whatever the demo's listings are: a search that only works by meaning,
// a question the assistant can answer from real listings, and a moderator tab with content.
const SEARCH = 'something to make me smell nice';
const ASK = 'something to stay warm this winter';
const MODERATOR_TAB = 'Reported Messages';

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

type StorageState = Awaited<ReturnType<import('@playwright/test').BrowserContext['storageState']>>;

async function session(record = false, storageState?: StorageState) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: record ? 1 : 2,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    storageState,
    ...(record ? { recordVideo: { dir: join(OUT, 'video'), size: VIEWPORT } } : {}),
  });
  return { context, page: await context.newPage() };
}

async function logInAs(page: Page, role: 'seller' | 'buyer' | 'moderator') {
  await page.goto(`${SITE}/login`);
  await page.getByRole('button', { name: new RegExp(`\\(${role}\\)`) }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
  await page.waitForLoadState('networkidle');
}

type Clip = { x: number; y: number; width: number; height: number };

async function shot(page: Page, name: string, clip?: Clip) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800); // let images and fonts settle
  await page.screenshot({ path: join(OUT, `${name}.png`), clip });
  console.log(`saved ${name}.png`);
}

// Stills, as the buyer and the moderator.
{
  const { context, page } = await session();
  await logInAs(page, 'buyer');
  const query = encodeURIComponent(SEARCH);
  await page.goto(`${SITE}/listings?q=${query}&semantic=true`);
  await shot(page, 'search');
  // The home page thumbnail: the first row of results, at 16:10.
  await shot(page, 'thumb', { x: 384, y: 222, width: 640, height: 400 });

  await page.goto(SITE);
  await page.getByRole('button', { name: /Ask AI/ }).click();
  await page.getByPlaceholder('Ask about listings…').fill(ASK);
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.waitForTimeout(12_000); // the reply streams in
  await shot(page, 'assistant');
  await context.close();
}
{
  const { context, page } = await session();
  await logInAs(page, 'moderator');
  await page.goto(`${SITE}/admin`);
  await page.getByText(MODERATOR_TAB, { exact: true }).click();
  await shot(page, 'moderator', { x: 0, y: 0, width: 1280, height: 520 });
  await context.close();
}

// The clip: asking the assistant for something, as the buyer. Logging in happens first in
// an unrecorded session, so the clip starts on the home page.
{
  const login = await session();
  await logInAs(login.page, 'buyer');
  const state = await login.context.storageState();
  await login.context.close();
  const { context, page } = await session(true, state);
  const recordingStarted = Date.now();
  await page.goto(SITE);
  await page.waitForLoadState('networkidle');
  await page.getByRole('heading', { name: /Latest Listings/ }).waitFor();
  // The clip starts here, once the page has loaded, rather than on the loading screen.
  const start = (Date.now() - recordingStarted) / 1000;
  await page.waitForTimeout(1_000);
  await page.getByRole('button', { name: /Ask AI/ }).click();
  await page.waitForTimeout(600);
  await page.getByPlaceholder('Ask about listings…').pressSequentially(ASK, {
    delay: 60,
  });
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Send message' }).click();
  await page.getByText('Related listings').waitFor({ timeout: 30_000 });
  await page.waitForTimeout(2_500);
  await context.close();
  const dir = join(OUT, 'video');
  const [file] = readdirSync(dir).filter((f) => f.endsWith('.webm'));
  const trim = spawnSync('ffmpeg', [
    '-loglevel',
    'error',
    '-y',
    '-ss',
    start.toFixed(2),
    '-i',
    join(dir, file),
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '20',
    join(OUT, 'assistant.webm'),
  ]);
  if (trim.status !== 0) throw new Error(String(trim.stderr));
  rmSync(dir, { recursive: true, force: true });
  console.log(`saved assistant.webm (trimmed ${start.toFixed(1)}s of loading)`);
}

await browser.close();
