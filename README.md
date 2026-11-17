# xzanderbr.github.io

My personal site: who I am, what I've built, and my resume. It's also a small project in its own right.

## Stack

- **[Astro](https://astro.build)** renders every page to static HTML. A portfolio is mostly content, so visitors don't download a framework runtime to read it.
- **React loads on demand.** Pages ship about 20KB of JavaScript. The command palette (Ctrl K, ⌘K or `/`) fetches React the first time it opens, and the theme toggle is a few lines of plain script.
- **Tailwind CSS v4 and shadcn/ui** for styling and the palette's dialog.
- **MDX content collections** for the case studies, validated with a Zod schema, so a malformed project fails the build.
- **Build-time data:** Rivals Toolkit's download count comes from the GitHub releases API when the site builds, with a static fallback if GitHub is unreachable.
- **Generated preview images** for each page with satori and resvg.

## Commands

```bash
bun install
bun run dev          # local dev server
bun run build        # static site in dist/
bun run test         # unit tests (Vitest)
bun run test:e2e     # end-to-end tests (Playwright, builds first)
bun run check:copy   # copy rules, run after a build
```

Locally, Playwright runs Chromium and WebKit. Set `PW_FIREFOX=1` to add Firefox (CI always runs all three).

## Adding a project

Add an MDX file to `src/content/projects/`. The frontmatter schema lives in `src/lib/schema.ts`; `order` sets its place on the home page. Its architecture diagram goes in `src/components/diagrams/`.

Everything else on the home page (intro, experience, other projects, About) is in `src/data/profile.ts`.

## Updating the resume

The PDF comes from the web version of my LaTeX resume. After compiling it:

```bash
bun run sync:resume [path/to/resume_web.pdf]
```

The script refuses a PDF that isn't one page or that contains a phone number.

## Deploying

Every push runs `.github/workflows/ci.yml`: type checks, lint, unit and end-to-end tests on three browsers, axe accessibility checks, a Lighthouse budget, an internal link check and the copy rules. On `main`, the same run publishes to GitHub Pages, but only after every check has passed.

The private copy rules live in a `COPY_RULES` repository secret (one regex per line, as in `src/lib/copy-check.ts`).
