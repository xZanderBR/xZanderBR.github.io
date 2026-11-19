# xzanderbr.github.io

My personal site: who I am, what I've built, and my resume. It's also a small project in its own right.

## Stack

- **[Astro](https://astro.build)** renders every page to static HTML. A portfolio is mostly content, so visitors don't download a framework runtime to read it.
- **React loads on demand.** Pages ship about 20KB of JavaScript. The command palette (Ctrl K, ⌘K or `/`) fetches React when you hover or focus the Search button, or the first time it opens, and the theme toggle is a few lines of plain script.
- **Tailwind CSS v4 and shadcn/ui** for styling and the palette's dialog.
- **MDX content collections** for the case studies, validated with a Zod schema, so a malformed project fails the build.
- **Build-time data:** Rivals Toolkit's download count comes from the GitHub releases API when the site builds, with a static fallback if GitHub is unreachable.
- **Generated preview images** for each page with satori and resvg, showing the same live numbers as the home page.
- **Real visuals, light on weight:** screenshots served as AVIF or WebP at the size the screen needs, short silent clips that only play on screen and stay still under reduced motion, a YouTube embed that loads nothing from YouTube until it's played, and charts drawn at build time from real data, with no JavaScript sent for them.
- **Icons from one SVG:** the favicon, `favicon.ico` and Apple touch icon are all rendered at build from `src/lib/icons.ts`.
- **Search:** `robots.txt`, a sitemap, and schema.org `Person` data on the home page.
- **Accessibility:** a skip link, full support for reduced motion, and diagrams with a tall layout for phones. axe runs on every page in CI.
- **Self-hosted font** with a size-matched fallback, so text doesn't shift when it loads.

## Commands

```bash
bun install
bun run dev          # local dev server
bun run build        # static site in dist/
bun run test         # unit tests (Vitest)
bun run test:e2e     # end-to-end tests (Playwright, builds first)
bun run check:copy   # copy rules, run after a build
```

Locally, Playwright runs Chromium and WebKit, plus a Chromium project with real scrollbars for the overflow checks. Set `PW_FIREFOX=1` to add Firefox (CI always runs it).

## Adding a project

Add an MDX file to `src/content/projects/`. The frontmatter schema lives in `src/lib/schema.ts`; `order` sets its place on the home page. Its architecture diagram goes in `src/components/diagrams/`.

Each project has a `hero` (the visual under the title: an image, a clip, a YouTube video or a chart) and a `thumb` (its preview on the home page). Images go in `src/assets/projects/<slug>/` and clips in `public/media/<slug>/`.

## Screenshots, clips and data

Raw captures go in `media-src/<slug>/`, which git ignores. `scripts/capture/optimize.sh <slug>` turns them into the files the site uses (WebP stills, H.264 clips).

- **Aztec List:** `bun scripts/capture/aztec-list.ts` captures the live demo at azteclist.com, clip included.
- **Pourtocol:** screens from the web app running with its device simulator (`MOCK_ESP32=true`) and made-up names; the video poster is the YouTube thumbnail.
- **Rivals Toolkit:** captured by hand on Windows.
- **Licensing:** `src/data/licensing-stats.json` is a snapshot of the license server's Cloudflare Workers metrics (last 30 days): requests per day, errors, median CPU time, and requests by data center country. Counts only. To refresh it, read the same numbers from the dashboard and keep the shape; `src/lib/stats.ts` checks it at build.
- **Struc-AI:** `src/data/strucai-catches.json` holds the totals from that repo's `tools/score_archive.py`, grouped by kind of check. Totals only; no project names.

Everything else on the home page (intro, experience, other projects, About) is in `src/data/profile.ts`.

## Updating the resume

The private Resume repo is the only source. Its `resume.tex` builds both the full resume and this site's web version (the same, without the phone number). On every resume change, a workflow there builds the PDFs, runs `scripts/sync-resume.ts` from this repo to check the web one (one page, no phone number, the private copy rules), and opens or updates an "Update resume" PR here. Merge it to publish.

To test a local build by hand:

```bash
bun run sync:resume [path/to/resume-web.pdf]
```

## Deploying

Every push runs `.github/workflows/ci.yml`: type checks, lint, unit and end-to-end tests on three browsers, axe accessibility checks, Lighthouse on every page (median of 3 runs, 0.95 minimum), an internal link check and the copy rules. On `main`, the same run publishes to GitHub Pages, but only after every check has passed.

The private copy rules live in a `COPY_RULES` repository secret (one regex per line, as in `src/lib/copy-check.ts`).

Dependabot opens weekly update PRs for packages (minor and patch grouped) and GitHub Actions.
