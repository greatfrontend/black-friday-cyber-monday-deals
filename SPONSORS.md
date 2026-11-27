# Sponsor Ctrl Friday

Ctrl Friday has 9 sponsor slots at the top of [ctrlfriday.com](https://ctrlfriday.com/). GreatFrontEnd holds one, and the other 8 are for sale. The current price, end date and number of open slots are on [ctrlfriday.com/sponsor](https://ctrlfriday.com/sponsor) and in the Sponsors block of the [README](README.md).

## What you get

- **A slot in the homepage hero.** Your logo, product name, and discount appear in the sponsor grid. Selecting the ticket opens your deal.
- **A pinned deal card.** Your deal is listed first in All deals and in its category, ahead of unsponsored deals, in the default order.
- **A highlighted listing.** Your deal card and detail view display a Sponsored label.
- **A place in the README.** Your logo and link in the Sponsors block near the top of this repository's README.
- **A roundup post.** One post on GreatFrontEnd’s socials (LinkedIn, Instagram, X) naming every sponsor, published during Cyber Monday.

Placements run until the end date shown on the sponsor page. Sponsors are ordered by when they paid.

## How to claim a slot

1. Read the [eligibility rules](#eligibility) below.
2. Pay through the button on [ctrlfriday.com/sponsor](https://ctrlfriday.com/sponsor). Stripe emails you a receipt. Keep its receipt number.
3. Open a pull request with the three changes described in the next section, and put your receipt number in the description.
4. We match the receipt to your payment and review the listing, typically within one business day.
5. Your placement goes live when the pull request is merged and the site redeploys.

## What goes in the pull request

Use your product's ID everywhere: a lowercase, hyphen-separated name such as `example-tool`.

**1. Your deal.** Add or update `data/deals/2026/example-tool.json`. The [contribution guide](CONTRIBUTING.md) explains each field. Your hero slot, card and README entry all read from this file, so there is nothing to repeat elsewhere.

**2. Your logo.** Add `assets/sponsors/2026/example-tool.svg` (or `.png`):

- Square, with its own solid background so it reads on light and dark themes.
- SVG or PNG, 100 KB or smaller. A PNG should be at least 256 by 256 pixels.
- Named after your product ID.

**3. Your slot.** Append an entry to the end of `slots` in [data/sponsors/2026.json](data/sponsors/2026.json):

```json
{ "dealId": "example-tool", "logo": "example-tool.svg" }
```

If a maintainer told you a slot is being held for you, replace one `{ "reserved": true }` entry instead of appending.

Then regenerate the README and check your changes:

```sh
pnpm --dir www install --frozen-lockfile
pnpm --dir www run data:sync
pnpm --dir www run data:check
```

Commit the JSON, the logo and the updated `README.md` together. If you edit on GitHub without running these commands, a maintainer can run `data:sync` for you.

Fill in the [sponsor PR template](.github/PULL_REQUEST_TEMPLATE/sponsor.md) with your product, Stripe receipt number, and checklist. To prefill the description on GitHub, include `template=sponsor.md` in the pull request URL’s query string.

## Eligibility

- A real Black Friday or Cyber Monday offer, live now or with a stated start date.
- A product made for developers or designers.
- Accurate names, prices, discounts and dates.
- A logo and name you have the right to use.

Every placement is labelled Sponsored, and its links carry `rel="sponsored"`. We may decline a product, or edit a listing for accuracy. A slot buys placement, not results: we don't promise clicks, sign-ups or sales.

## Refunds

You get a full refund if we decline your product, if every slot was taken before your payment arrived, or if you withdraw before your pull request is merged. Once your placement is live, payments are not refunded.

## For maintainers

[data/sponsors/2026.json](data/sponsors/2026.json) is the source of truth for the year. The site, the sponsor page and the README block are generated from it.

- **Open checkout.** Set `checkoutUrl` to the Stripe Payment Link and `contactEmail` to the address for sponsor questions. Until `checkoutUrl` is set, the sponsor page shows "Checkout opens soon".
- **Hold a slot.** When a payment arrives, append `{ "reserved": true }` to `slots` so the site stops advertising that slot before the sponsor's pull request is merged.
- **Verify a pull request.** Look up the receipt number in Stripe and confirm the payment belongs to the product in the pull request before merging.
- **End the season.** After `endsOn`, set `status` to `"ended"` and run `data:sync`. The hero goes back to the catalog's `featuredDealIds`, pinned cards and labels are removed, and the README block is emptied. `data:check` prints a reminder once the date has passed.

Run `pnpm --dir www run data:sync` after any change to the file.
