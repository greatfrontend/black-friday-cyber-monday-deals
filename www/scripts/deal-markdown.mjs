import path from 'node:path';
import { moveDealsToEnd } from '../src/lib/deal-order.ts';
import { pinSponsoredDeals } from '../src/lib/sponsors.ts';

const tablePattern = /(^\|[^\n]*(?:\n|$))+/m;
const sponsorBlockPattern = /<!-- sponsors:start -->[\s\S]*?<!-- sponsors:end -->/;

function formatLatestFlag(latest) {
  if (latest === true) {
    return '✅';
  }

  if (latest === false) {
    return '❌';
  }

  return '';
}

function createDealRow(deal, hasLatestColumn) {
  const row = [`[${deal.name}](${deal.url})`, deal.description, deal.offer, deal.validity];

  if (hasLatestColumn) {
    row.push(formatLatestFlag(deal.latest));
  }

  return row;
}

function renderRow(cells) {
  const escapedCells = cells.map((cell) => cell.replaceAll('|', '&#124;'));
  return `| ${escapedCells.join(' | ')} |`;
}

export function renderTable(catalog, categoryId) {
  const headers = ['**Name**', '**Description**', '**Deal details**', '**Validity**'];

  if (catalog.hasLatestColumn) {
    headers.push('**Latest**');
  }

  const deals = catalog.deals.filter((deal) => deal.categories.includes(categoryId));
  const category = catalog.categories.find(({ id }) => id === categoryId);
  const ordered = pinSponsoredDeals(moveDealsToEnd(deals, category?.lastDealIds), catalog);
  const rows = ordered.map((deal) => createDealRow(deal, catalog.hasLatestColumn));

  return [headers, headers.map(() => ':-'), ...rows].map(renderRow).join('\n');
}

function findCategorySection(markdown, heading, source) {
  const marker = `## ${heading}\n`;
  const start = markdown.indexOf(marker);

  if (start === -1 || markdown.indexOf(marker, start + marker.length) !== -1) {
    throw new Error(`${source}: missing or ambiguous heading ${heading}`);
  }

  const bodyStart = start + marker.length;
  const nextHeading = markdown.indexOf('\n## ', bodyStart);
  const sectionEnd = nextHeading === -1 ? markdown.length : nextHeading;

  return {
    before: markdown.slice(0, bodyStart),
    body: markdown.slice(bodyStart, sectionEnd),
    after: markdown.slice(sectionEnd),
  };
}

function replaceCategoryTable(markdown, catalog, category) {
  const section = findCategorySection(markdown, category.heading, catalog.source);
  const match = section.body.match(tablePattern);

  if (!match) {
    throw new Error(`${catalog.source}: no table under ${category.heading}`);
  }

  const trailingNewline = match[0].endsWith('\n') ? '\n' : '';
  const replacement = renderTable(catalog, category.id) + trailingNewline;
  const updatedBody = section.body.replace(tablePattern, () => replacement);

  return section.before + updatedBody + section.after;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Singapore',
  }).format(new Date(value));
}

function updateCheckedDate(markdown, lastChecked) {
  if (!lastChecked) {
    return markdown;
  }

  return markdown.replace(
    /\*\*Deals last checked: .*?\.\*\*/,
    `**Deals last checked: ${formatDate(lastChecked)}.**`,
  );
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Archives live one directory below the README, so repository paths are made relative.
function linkFromSource(source, repositoryPath) {
  return path.posix.relative(path.posix.dirname(source), repositoryPath);
}

function renderSponsorCell(catalog, sponsor) {
  const deal = catalog.deals.find(({ id }) => id === sponsor.dealId);
  const logo = linkFromSource(catalog.source, `assets/sponsors/${catalog.year}/${sponsor.logo}`);

  return (
    `<td align="center"><a href="${escapeHtml(deal.url)}">` +
    `<img src="${logo}" alt="" width="56" height="56"><br>` +
    `<strong>${escapeHtml(deal.name)}</strong></a></td>`
  );
}

function renderSponsorAvailability(catalog) {
  const { slots, slotCount, priceUsd, endsOn } = catalog.sponsorship;
  const openSlots = slotCount - slots.length;
  const availability = `${openSlots} ${openSlots === 1 ? 'slot' : 'slots'} remaining`;

  if (openSlots === 0) {
    return `${availability}.`;
  }

  const guide = linkFromSource(catalog.source, 'SPONSORS.md');
  return (
    `**${availability}** at $${priceUsd} each, ` +
    `live until ${formatDate(endsOn)}. [Become a sponsor](${guide}).`
  );
}

export function renderSponsorBlock(catalog) {
  if (catalog.sponsorship.status !== 'active') {
    return '';
  }

  const cells = catalog.sponsorship.slots
    .filter((slot) => slot.dealId)
    .map((sponsor) => `    ${renderSponsorCell(catalog, sponsor)}`);
  const table = cells.length ? ['<table>', '  <tr>', ...cells, '  </tr>', '</table>', ''] : [];
  const perks =
    'Get a **homepage hero slot**, a **pinned deal** with a Sponsored badge, and a mention in ' +
    'GreatFrontEnd’s **Cyber Monday roundup** on LinkedIn, Instagram, and X.';

  return ['## Sponsors', '', ...table, perks, '', renderSponsorAvailability(catalog)].join('\n');
}

function replaceSponsorBlock(markdown, catalog) {
  if (!catalog.sponsorship) {
    return markdown;
  }

  if (!sponsorBlockPattern.test(markdown)) {
    throw new Error(
      `${catalog.source}: add <!-- sponsors:start --> and <!-- sponsors:end --> where the sponsor block belongs`,
    );
  }

  const block = renderSponsorBlock(catalog);
  const content = block ? `\n\n${block}\n\n` : '\n';

  return markdown.replace(
    sponsorBlockPattern,
    () => `<!-- sponsors:start -->${content}<!-- sponsors:end -->`,
  );
}

export function renderMarkdown(catalog, markdown) {
  for (const category of catalog.categories) {
    markdown = replaceCategoryTable(markdown, catalog, category);
  }

  markdown = replaceSponsorBlock(markdown, catalog);
  return updateCheckedDate(markdown, catalog.lastChecked);
}
