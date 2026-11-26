# Add or update a deal

Each product has its own JSON file in `data/deals/<year>/`. The website and Markdown tables are generated from these files. No command-line editor is needed.

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
| `courses` | Technical courses and learning platforms |
| `ui-kits-starter-kits` | UI components, templates, starter kits, and boilerplates |
| `developer-tools` | Developer applications, utilities, and hosting |
| `books-for-developers-and-software-engineers` | Developer books and related resources |
| `ai-powered-tools-for-developers` | AI applications and developer APIs |
| `design-kits` | Icons, design assets, and design systems |
| `design-courses` | Design and UI/UX courses |

A product can have multiple categories. Use one file with a `categories` array instead of duplicating the product. Historical catalogs retain their original categories; `data/catalogs/<year>.json` defines the category headings available for each year.

## Field guidelines

- Preserve existing referral URLs unless correcting an incorrect destination.
- Set `faviconUrl` to the product's favicon URL when the deal link points through an affiliate network or displays the wrong icon.
- Descriptions and offers support Markdown. Include coupon codes in `offer` for the README and in `couponCodes` for the website.
- Preserve uncertainty in `validity`; use `-` if unknown. Do not invent exact deadlines, timezones, or discounts.
- `latest` preserves the original Latest column: `true`, `false`, or `null` for unknown. It does **not** mean currently active or independently verified.
- `order` is optional. Existing products have it to preserve the original listing order. New products can omit it and will appear after ordered products, sorted by filename. Renumbering existing products is unnecessary.
- `allDealsPlacements` in `data/catalogs/<year>.json` can place a `dealId` immediately after an `afterDealId` in the default All deals view. Placements apply in the order listed.
- A category in `data/catalogs/<year>.json` can list `lastDealIds` for deals that appear at the end of its default order and README table, in the order listed.
- The catalog's `lastChecked` applies to the entire year. Use a calendar date or an ISO 8601 timestamp with a time zone. Update it only after reviewing the whole catalog.
- A previous year's listing is not evidence of a current sale.

## Check your contribution

For contributors working locally, install the website tools once and run:

```sh
pnpm --dir www install --frozen-lockfile
pnpm --dir www run data:sync
pnpm --dir www run data:check
pnpm --dir www test
```

Commit the product JSON and generated Markdown together. You can edit JSON directly on GitHub, but the Markdown tables must be synchronized before merging; a maintainer can run `data:sync` for browser-only submissions.

Do not edit Markdown tables directly or commit `www/public/data/`. Exports are generated on development startup and before production builds. Pull requests check required fields, category IDs, filenames, URLs, and Markdown synchronization.

## Category and catalog maintenance

To add a category, update the allowed values in `data/categories.json`, add its heading to the year's `data/catalogs/<year>.json`, and add the corresponding `##` heading and empty Markdown table to the source document. Update its navigation links, then run `data:sync`.

The schemas in `data/product.schema.json` and `data/deal-catalog.schema.json` validate product fields and catalog metadata. The category schema provides the shared allowed values without duplicating them in the product schema.

## Website data

`data:export` combines the product files into `/data/<year>.json` and creates `/data/index.json`. It also exports `/data/categories.json` for website category labels and form options. The build copies these static files into `www/dist/client/data/`. No database is involved.

## Sponsor slots

The tiles in the homepage hero are paid sponsor slots while a year's sponsorship is active. They are defined in `data/sponsors/<year>.json`, with logos in `assets/sponsors/<year>/`. [SPONSORS.md](SPONSORS.md) covers the perks, the rules, and what a sponsor's pull request contains.

## Curate the hero previews

The hero shows these previews only when the year has no active sponsorship.

Maintainers can set `featuredDealIds` in `data/catalogs/<year>.json` to choose up to six hero previews, in display order. Each ID is the product JSON filename without `.json`, from the same year. These are editorial selections, not popularity or discount rankings. Missing IDs, duplicates, and more than six selections fail validation. Catalogs without this optional field use their first six deals.

Run `pnpm --dir www run data:export` after changing display labels or hero selections; the dev and build commands also regenerate these files.
