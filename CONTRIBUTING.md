# Add or update a deal

Each product has its own JSON file in `data/deals/<year>/`. The website and Markdown tables are generated from these files. No command-line editor is needed.

The README shows up to five deals per category and links to the full category on Ctrl Friday.

## Submit without editing files

Open an issue and choose **Add or update a deal**. Include the product link, offer, coupon codes, validity, and source. A maintainer reviews the submission and updates the product file. Submitting an issue does not create a PR or publish a deal automatically.

## Edit a product

Find its file in [data/deals/2026/](data/deals/2026/), edit the fields, and open a pull request. For example: [greatfrontend-interviews.json](data/deals/2026/greatfrontend-interviews.json).

Keep the filename stable when updating a product. It is the product's ID. Previous years stay separate under `2025/` and `2024/`.

## Add a product

Copy [example-product.json](data/example-product.json) into `data/deals/2026/`, rename it to a lowercase, hyphen-separated product name, and change its `$schema` to `../../product.schema.json`:

```text
 data/
   categories.json
   catalogs/2026.json
   deals/2026/
     greatfrontend-interviews.json
     hello-interview.json
     your-product.json
```

```json
{
  "$schema": "../../product.schema.json",
  "name": "Example Tool",
  "url": "https://example.com/pricing",
  "categories": ["developer-tools"],
  "description": "A short description of the product.",
  "offer": "30% off annual plans with code **SAVE30**",
  "couponCodes": ["SAVE30"],
  "validity": "Ends Nov 30; timezone not stated",
  "latest": null
}
```

The loader discovers new files automatically. You do not need to add the product to an index or repeat the ID/year inside the file.

## Choose categories

[Categories](data/categories.json) is the shared list of allowed IDs, display names, and descriptions. Each option’s `title` is the website display label; the website and search read the generated export of this same file. Annual Markdown headings remain in the catalog metadata. It is also a JSON Schema, so compatible editors can suggest category IDs using the product file's `$schema` link. Validation uses this same list; unknown IDs are rejected with a list of valid choices.

For 2026, use:

| ID | Use for |
| --- | --- |
| `technical-interviews-preparation` | Interview preparation, coding practice, and system design resources |
| `developer-courses` | Technical courses and learning platforms |
| `ui-kits-starter-kits` | UI components, templates, starter kits, and boilerplates |
| `developer-tools` | Developer applications, utilities, and hosting |
| `books-for-developers-and-software-engineers` | Developer books and related resources |
| `ai-powered-tools-for-developers` | AI applications and developer APIs |
| `design-kits` | Icons, design assets, and design systems |
| `design-courses` | Design and UI/UX courses |
| `design-books` | Books and ebooks about UI, UX, graphic design, and typography |
| `productivity-tools` | Notes, tasks, calendars, focus tools, and desktop workflows |
| `general-ai-tools` | General-purpose AI chat, writing, research, and automation tools |
| `design-tools` | Visual design, prototyping, and illustration apps |
| `marketing-seo` | Email marketing, advertising, audience research, and search optimization |
| `business-tools` | Business operations, analytics, billing, and support software |
| `social-media-tools` | Social content creation, publishing, and analytics |
| `finance-tools` | Budgeting, invoicing, investment tracking, and financial research |
| `utilities` | File, device, media, privacy, and system tools |
| `health-and-fitness` | Exercise, sleep, nutrition, and wellness apps |
| `miscellaneous` | Other consumer and specialty apps, including travel and entertainment |

A product can have multiple categories. Use one file with a `categories` array instead of duplicating the product. Historical catalogs retain their original categories; `data/catalogs/<year>.json` defines the category headings available for each year.

## Field guidelines

- Preserve existing referral URLs unless correcting an incorrect destination.
- Set `faviconUrl` to the product's favicon URL when the deal link points through an affiliate network or displays the wrong icon.
- Descriptions and offers support Markdown. Include coupon codes in `offer` for the README and in `couponCodes` for the website.
- Preserve uncertainty in `validity`; use `-` if unknown. Do not invent exact deadlines, timezones, or discounts.
- `latest` preserves the original Latest column: `true`, `false`, or `null` for unknown. It does **not** mean currently active or independently verified.
- Default listings show sponsors in slot order first. The remaining deals sort by `order` from lowest to highest, with unnumbered deals after numbered ones.
- `addedAt` records when a deal first joins the directory. Set it when accepting a new deal, using an ISO 8601 timestamp with a time zone, such as `2026-11-27T09:30:00+08:00`. Use the original timestamp when updating the deal. When `order` ties or is absent on both deals, undated entries appear first, then dated entries from oldest to newest. Matching timestamps sort alphabetically by filename.
- `allDealsPlacements` in `data/catalogs/<year>.json` can place a `dealId` immediately after an `afterDealId` in the default All deals view. Placements apply in the order listed.
- A category in `data/catalogs/<year>.json` can list `lastDealIds` for deals that appear at the end of its default order, in the order listed.
- The catalog's `lastChecked` applies to the entire year. Use a calendar date or an ISO 8601 timestamp with a time zone. Update it only after reviewing the whole catalog.
- A previous year's listing is not evidence of a current sale.

## Check your contribution

For contributors working locally, install the website tools once and run:

```sh
pnpm install --frozen-lockfile
pnpm run data:sync
pnpm run data:check
pnpm test
```

Commit the product JSON and generated Markdown together. You can edit JSON directly on GitHub, but the Markdown tables must be synchronized before merging; a maintainer can run `data:sync` for browser-only submissions.

Do not edit Markdown tables directly or commit `public/data/`. Exports are generated on development startup and before production builds. Pull requests check required fields, category IDs, filenames, URLs, and Markdown synchronization.

For website interaction changes, run the browser tests against a local production build:

```sh
pnpm exec playwright install chromium
pnpm run test:e2e
```

## Open a pull request

Fill in the [default PR template](.github/pull_request_template.md), or use the [sponsor PR template](.github/PULL_REQUEST_TEMPLATE/sponsor.md) when claiming a slot. If the description starts blank, copy the template into it. Keep the checklist and tick each statement that is true for your submission.

## Category and catalog maintenance

The order of the `categories` array in [the 2026 catalog](data/catalogs/2026.json) defines the order in the website sidebar and both category lists in the README. Run `data:sync` after changing the order.

To add a category, update `data/categories.json` and the annual catalog, then add its `##` heading and an empty table between the `category-sections` markers in the README. Add the matching navigation link between the `category-navigation` markers and end its line with `<!-- category:your-category-id -->`. Run `data:sync` to populate the table and put both entries in catalog order.

The schemas in `data/product.schema.json` and `data/deal-catalog.schema.json` validate product fields and catalog metadata. The category schema provides the shared allowed values without duplicating them in the product schema.

## Website data

`data:export` combines the product files into `/data/<year>.json` and creates `/data/index.json`. It also exports `/data/categories.json` for website category labels and form options. The build copies these static files into `dist/client/data/`. No database is involved.

## Sponsor slots

The tiles in the homepage hero are paid sponsor slots while a year's sponsorship is active. They are defined in `data/sponsors/<year>.json`, with logos in `assets/sponsors/<year>/`. [SPONSORS.md](SPONSORS.md) covers the perks, the rules, and what a sponsor's pull request contains.

## Curate the hero previews

The hero shows these previews only when the year has no active sponsorship.

Maintainers can set `featuredDealIds` in `data/catalogs/<year>.json` to choose up to six hero previews, in display order. Each ID is the product JSON filename without `.json`, from the same year. These are editorial selections, not popularity or discount rankings. Missing IDs, duplicates, and more than six selections fail validation. Catalogs without this optional field use their first six deals.

Run `pnpm run data:export` after changing display labels or hero selections; the dev and build commands also regenerate these files.
