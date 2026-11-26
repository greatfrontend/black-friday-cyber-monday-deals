# Local development

This project uses Void, Vite+, React, TypeScript, Tailwind CSS, and customized shadcn-style Base UI components. The static directory includes search, category and offer filters, year archives, grid/list layouts, coupon copying, saved deals, and light/dark themes. Deal data is maintained in the root `data/` directory; see [CONTRIBUTING.md](CONTRIBUTING.md) for adding or updating deals.

The website is contained in `www/`. Use Node.js 26.13.1 (pinned in `www/.node-version`), or another version supported by the `engines` field in `www/package.json`. Use the pnpm version pinned in its `packageManager` field.

```sh
cd www
pnpm install --frozen-lockfile
pnpm run dev
```

Open the localhost URL printed by Vite.

```sh
pnpm run typecheck
pnpm test
pnpm run format:check
pnpm run build
pnpm run preview
```

Run website commands from `www/`. `www/void.config.ts` enables `output: "static"`. The production website is generated in `www/dist/client/`, including prerendered HTML. No database or deployment account is configured.

The app lives in `www/pages/`, public files live in `www/public/`, and Void's version-matched documentation and agent skill are available in `www/node_modules/void/docs/` and `www/node_modules/void/skills/void/SKILL.md`.

Website components live in `www/src/components/`, pure filtering logic in `www/src/lib/`, and browser state hooks in `www/src/hooks/`. Brand and theme tokens live in `www/pages/style.css`. The shared `cn` utility combines `clsx` with `tailwind-merge`.

Search/filter state is stored in the URL. Saved deals and theme preferences remain in the visitor's browser. The current collection is prerendered into HTML, and archives load from static JSON on demand. Website favicons load directly from Google's favicon service with a globe fallback; the request contains only the website origin, without referral parameters.

Submit and edit actions hand off to the existing GitHub contribution form or repository. They do not create PRs or publish changes automatically.

Formatting uses Vite+'s Prettier-compatible Oxfmt formatter, configured in the `fmt` block of `www/vite.config.ts`. Run `pnpm run format` from `www/` to apply formatting, or `pnpm run format:check` to check it without changing files. The formatter uses two-space indentation, single quotes, semicolons, trailing commas, a 100-column print width, and LF line endings. Generated files are excluded. CI runs the format check on every pull request.

The deal tooling in `www/scripts/` is organized by responsibility:

- `deals.mjs`: parses commands and dispatches them.
- `deal-validation.mjs`: checks catalog schemas, uniqueness, and category references.
- `deal-markdown.mjs`: renders tables and updates document content without writing files.
- `deal-data.mjs`: loads product files, synchronizes Markdown, and exports website JSON.

Canonical deal data lives in `data/deals/<year>/<product-id>.json`, with one file per product per year. Catalog metadata lives in `data/catalogs/<year>.json`. The filename supplies the product ID; the directory supplies the year. The loader automatically discovers product files and combines them into annual catalogs for the website. The README and archive tables are generated using `pnpm run data:sync` from `www/`. Existing media remains in `assets/`.

Development startup and production builds export the catalogs to `www/public/data/`. The website can load `/data/index.json` to discover the catalog years and `/data/2026.json` for the current deals. The files are static and are copied into the production output. `pnpm run build` also checks that the Markdown tables match the JSON; run `pnpm run data:sync` after direct edits.

The exporter also writes `www/src/data/initial-data.json` for the page’s initial JavaScript import. Public JSON is served by URL; it is never imported into source modules. Both outputs are generated from the canonical product files.
