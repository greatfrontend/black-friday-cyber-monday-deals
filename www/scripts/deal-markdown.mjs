const tablePattern = /(^\|[^\n]*(?:\n|$))+/m;

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
  const rows = deals.map((deal) => createDealRow(deal, catalog.hasLatestColumn));

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

function updateCheckedDate(markdown, lastChecked) {
  if (!lastChecked) {
    return markdown;
  }

  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${lastChecked}T00:00:00Z`));

  return markdown.replace(/\*\*Deals last checked: .*?\.\*\*/, `**Deals last checked: ${date}.**`);
}

export function renderMarkdown(catalog, markdown) {
  for (const category of catalog.categories) {
    markdown = replaceCategoryTable(markdown, catalog, category);
  }

  return updateCheckedDate(markdown, catalog.lastChecked);
}
