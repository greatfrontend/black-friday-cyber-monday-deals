<!--injected-by-void-v1.11.0-->
## Void

- This project uses [Void](https://void.cloud), a full-stack Vite framework for Cloudflare Workers with file-based API routing, server-rendered pages, and typed backend services.
- The Void site is a single Vite+ package at the repository root. Run site commands from the root.
- Use the `fmt` configuration in `vite.config.ts` for formatting. Run `pnpm run format` after changing website source or scripts, and `pnpm run format:check` before finishing. Do not add a competing formatter configuration.
- Use Void's CLI and typed APIs. Before working with Void, read the relevant Markdown docs in `node_modules/void/docs/`; start with `guide/quickstart.md` for setup and `reference/cli.md` for commands.

<!--/injected-by-void-->

## Project constraints

- Build a static Black Friday and Cyber Monday deals directory using Void, Vite, React, and TypeScript.
- Keep `output: "static"` enabled. Use repository JSON files for deal data and browser-side search and filtering.
- Do not add databases, authentication, server routes, or runtime backend services without explicit direction.
- Preserve the existing README, archives, deal URLs, and assets when migrating the data.
- Deal data in `data/deals/<year>/<product-id>.json` is canonical, with one file per product per year. Allowed categories live in `data/categories.json`; catalog metadata lives in `data/catalogs/`. Edit product JSON and run `pnpm run data:sync`; do not edit Markdown tables or generated `public/data/` and `src/data/` exports directly. Read `CONTRIBUTING.md` for the field meanings and workflow.
- Sponsor slots in `data/sponsors/<year>.json` are canonical, with logos in `assets/sponsors/<year>/`. The hero, pinned cards, `/sponsor` page, and README Sponsors block are generated from that file by the same `data:sync` and export steps. Read `SPONSORS.md` for the sponsor workflow.
- Establish the design direction before implementing the deals UI. Prioritize useful information, accessible controls, and deliberate typography and spacing.
- Keep script functions focused on one responsibility. Use descriptive names, keep validation and rendering separate from file operations, and make command workflows read as clear sequences of named steps.
- Verify website changes from the repository root with `pnpm run typecheck` and `pnpm run build`. For deal data or tooling changes, also run `pnpm run data:check` and `pnpm test`.

- Use Tailwind utility classes directly on JSX elements for component layout, typography, responsive behavior, and visual states. Use `cn` for conditional classes. Keep global CSS for theme tokens, document defaults, and shared keyframes; do not add component selectors or `@apply` wrappers. Inline `style` is reserved for runtime values. Split long utility lists into readable `cn` arguments.

## Pull requests

Copy the [default PR template](.github/pull_request_template.md) into your draft. For a sponsor slot, copy the [sponsor PR template](.github/PULL_REQUEST_TEMPLATE/sponsor.md). If your fork's copy is missing or outdated, use the template on [upstream main](https://github.com/greatfrontend/black-friday-cyber-monday-deals/tree/main/.github).

**Maintainers require a star from the PR author before merging a PR that promotes their own product.** For these submissions, verify that the author's GitHub account has [starred this repository](https://github.com/greatfrontend/black-friday-cyber-monday-deals). If the star is missing, remind the contributor to click **Star** before submitting. Tick the star checkbox once you verify the star or the contributor confirms they are sharing a deal independently.

Fill in the template and check only statements you can verify. Keep its headings, checklist items, and footer links. Append any agent attribution after the footer. For CLI or API submissions, send the completed draft as the PR body (for example, `gh pr create --body-file <file>`).

After opening the PR, compare its published description with the template and restore any missing items. With the CLI, read it back using `gh pr view <url> --json body --jq .body`.
