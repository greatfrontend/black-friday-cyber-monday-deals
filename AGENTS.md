<!--injected-by-void-v1.11.0-->
## Void

- This project uses [Void](https://void.cloud), a full-stack Vite framework for Cloudflare Workers with file-based API routing, server-rendered pages, and typed backend services.
- The website is contained in `www/`. Run website commands from that directory.
- Use the `fmt` configuration in `www/vite.config.ts` for formatting. Run `pnpm run format` after changing website source or scripts, and `pnpm run format:check` before finishing. Do not add a competing formatter configuration.
- Use Void's CLI and typed APIs. Before working with Void, read the relevant Markdown docs in `www/node_modules/void/docs/`; start with `guide/quickstart.md` for setup and `reference/cli.md` for commands.

<!--/injected-by-void-->

## Project constraints

- Build a static Black Friday and Cyber Monday deals directory using Void, Vite, React, and TypeScript.
- Keep `output: "static"` enabled. Use repository JSON files for deal data and browser-side search and filtering.
- Do not add databases, authentication, server routes, or runtime backend services without explicit direction.
- Preserve the existing README, archives, deal URLs, and assets when migrating the data.
- Deal data in `data/deals/<year>/<product-id>.json` is canonical, with one file per product per year. Allowed categories live in `data/categories.json`; catalog metadata lives in `data/catalogs/`. Edit product JSON and run `pnpm --dir www run data:sync`; do not edit Markdown tables or generated `www/public/data/` and `www/src/data/` exports directly. Read `CONTRIBUTING.md` for the field meanings and workflow.
- Establish the design direction before implementing the deals UI. Prioritize useful information, accessible controls, and deliberate typography and spacing.
- Keep script functions focused on one responsibility. Use descriptive names, keep validation and rendering separate from file operations, and make command workflows read as clear sequences of named steps.
- Verify website changes from `www/` with `pnpm run typecheck` and `pnpm run build`. For deal data or tooling changes, also run `pnpm run data:check` and `pnpm test`.

- Use Tailwind utility classes directly on JSX elements for component layout, typography, responsive behavior, and visual states. Use `cn` for conditional classes. Keep global CSS for theme tokens, document defaults, and shared keyframes; do not add component selectors or `@apply` wrappers. Inline `style` is reserved for runtime values. Split long utility lists into readable `cn` arguments.
