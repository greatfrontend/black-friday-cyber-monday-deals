# Local development

This project uses Void, Vite+, React, TypeScript, Tailwind CSS, and customized shadcn-style Base UI components. The static directory includes search, category and offer filters, year archives, grid/list layouts, coupon copying, saved deals, and light/dark themes. Deal data is maintained in the root `data/` directory; see [CONTRIBUTING.md](CONTRIBUTING.md) for adding or updating deals.

The Void site is a single Vite+ package at the repository root. Node.js 26.13.1 is pinned in `.node-version`, and pnpm is pinned in `package.json`.

```sh
vp install --frozen-lockfile
vp dev
```

Open the localhost URL printed by Vite.

```sh
vp run verify
vp test run
vp build
vp preview
```

If you use the project-local CLI, install with `pnpm install --frozen-lockfile` and run the commands above with `pnpm exec vp`. `void.config.ts` enables static output, with the prerendered website in `dist/client/`.

The app lives in `pages/`, and static files live in `public/`. Void's version-matched documentation and agent skill are in `node_modules/void/docs/` and `node_modules/void/skills/void/SKILL.md`.

Website components live in `src/components/`, filtering logic in `src/lib/`, and browser state hooks in `src/hooks/`. Brand and theme tokens live in `pages/style.css`. The shared `cn` utility combines `clsx` with `tailwind-merge`.

Search/filter state is stored in the URL. Saved deals and theme preferences remain in the visitor's browser. The current collection is prerendered into HTML, and archives load from static JSON on demand. Website favicons load directly from Google's favicon service with a globe fallback; the request contains only the website origin, without referral parameters.

Submit and edit actions hand off to the existing GitHub contribution form or repository. They do not create PRs or publish changes automatically.

Oxfmt, Oxlint, and Vitest are configured in `vite.config.ts`. Run `vp fmt` to apply formatting and `vp run verify` to check formatting, lint, and TypeScript. CI also runs the catalog checks, tests, and static build.

The deal tooling in `scripts/` is organized by responsibility:

- `deals.mjs`: parses commands and dispatches them.
- `deal-validation.mjs`: checks catalog schemas, uniqueness, and category references.
- `deal-markdown.mjs`: renders tables and updates document content without writing files.
- `deal-data.mjs`: loads product files, synchronizes Markdown, and exports website JSON.
- `sponsor-data.mjs`: loads a year's sponsorship file, checks its logo files, and copies logos into `public/sponsors/`.

Canonical deal data lives in `data/deals/<year>/<product-id>.json`, with one file per product per year. Catalog metadata lives in `data/catalogs/<year>.json`. The filename supplies the product ID and the directory supplies the year. The loader discovers product files and combines them into annual catalogs. Run `vp run data:sync` from the root to update the README and archive tables. Media lives in `assets/`.

`vp dev` and `vp build` export the catalogs to `public/data/`. The website loads `/data/index.json` to discover the catalog years and `/data/2026.json` for the current deals. The build also checks that the Markdown tables match the JSON.

The exporter also writes `src/data/initial-data.json` for the page’s initial JavaScript import. Public JSON is served by URL. Both outputs are generated from the canonical product files.

Cloudflare Workers Builds should use the repository root for both production and preview. Run `pnpm run build` there. Void writes the static site to `dist/client/` and the Cloudflare build output to `.cloudflare/output/`.
