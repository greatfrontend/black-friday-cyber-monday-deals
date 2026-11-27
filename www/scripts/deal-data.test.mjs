import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { syncMarkdown, readCatalogs, exportCatalogs } from './deal-data.mjs';
import { validateCatalog } from './deal-validation.mjs';
import { renderMarkdown } from './deal-markdown.mjs';

function fixture() {
  return {
    $schema: '../deal-catalog.schema.json',
    year: 2026,
    title: 'Developer deals',
    description: 'Discounts for developers.',
    source: 'README.md',
    lastChecked: null,
    hasLatestColumn: true,
    categories: [{ id: 'developer-tools', name: 'Developer tools', heading: 'Tools' }],
    deals: [
      {
        id: 'example-tool',
        name: 'Example Tool',
        url: 'https://example.com/?ref=community&plan=annual',
        categories: ['developer-tools'],
        description: 'A [useful tool](https://example.com/docs).',
        offer: '**SAVE30** - 30% off | annual plans',
        couponCodes: ['SAVE30'],
        validity: 'Ends about Nov 30',
        latest: null,
      },
    ],
  };
}

async function writeCatalogFixture(root, catalog) {
  const { deals, ...metadata } = catalog;
  await mkdir(path.join(root, 'data/catalogs'), { recursive: true });
  await writeFile(
    path.join(root, 'data/categories.json'),
    await readFile(new URL('../../data/categories.json', import.meta.url), 'utf8'),
  );
  await mkdir(path.join(root, 'data/deals', String(catalog.year)), { recursive: true });
  await writeFile(
    path.join(root, 'data/catalogs', `${catalog.year}.json`),
    JSON.stringify(metadata),
  );

  for (const { id, ...product } of deals) {
    await writeFile(
      path.join(root, 'data/deals', String(catalog.year), `${id}.json`),
      JSON.stringify(product),
    );
  }
}

const markdown = `# Developer deals

Introduction and disclosure.

<!-- category-navigation:start -->

- [Tools](#tools) <!-- category:developer-tools -->

<!-- category-navigation:end -->

<!-- category-sections:start -->

## Tools

| Name | Description | Deal | Validity | Latest |
| :- | :- | :- | :- | :- |

<!-- category-sections:end -->

---

## Disclaimer

Affiliate disclosure.
`;

test('schema rejects malformed contributions instead of silently accepting them', () => {
  for (const [patch, error] of [
    [{ url: 'javascript:alert(1)' }, /web-url/],
    [{ url: 'https://user:password@example.com' }, /web-url/],
    [{ faviconUrl: 'file:///private/favicon.ico' }, /\/faviconUrl.*web-url/],
    [{ offer: '' }, /\/offer/],
    [{ categories: ['missing'] }, /Unknown category/],
    [{ couponCodes: ['SAVE30', 'SAVE30'] }, /duplicate/],
    [{ latest: 'yes' }, /\/latest/],
    [{ addedAt: '2026-11-27T09:00:00' }, /\/addedAt.*date-time/],
    [{ active: true }, /additional properties/],
  ]) {
    const catalog = fixture();
    Object.assign(catalog.deals[0], patch);
    assert.throws(() => validateCatalog(catalog), error);
  }
  const catalog = fixture();
  catalog.lastChecked = '2026-02-30';
  assert.throws(() => validateCatalog(catalog), /calendar-date/);
});

test('catalog review timestamps require a timezone and use the Singapore date in Markdown', () => {
  const catalog = fixture();
  const source = `**Deals last checked: 25 Nov 2026.**\n\n${markdown}`;
  catalog.lastChecked = '2026-11-25';
  assert.equal(validateCatalog(catalog), catalog);
  assert.match(renderMarkdown(catalog, source), /Deals last checked: 25 Nov 2026/);

  catalog.lastChecked = '2026-11-25T18:30:00Z';
  assert.equal(validateCatalog(catalog), catalog);
  assert.match(renderMarkdown(catalog, source), /Deals last checked: 26 Nov 2026/);

  catalog.lastChecked = '2026-11-25T18:30:00';
  assert.throws(() => validateCatalog(catalog), /date-time/);
  catalog.lastChecked = '2026-02-30T18:30:00Z';
  assert.throws(() => validateCatalog(catalog), /date-time/);
});

test('curated hero selections reject missing, duplicate, and excessive product IDs', () => {
  const catalog = fixture();
  catalog.featuredDealIds = ['example-tool'];
  assert.equal(validateCatalog(catalog), catalog);
  catalog.featuredDealIds = ['missing-product'];
  assert.throws(() => validateCatalog(catalog), /featured deal missing-product does not exist/);
  catalog.featuredDealIds = ['example-tool', 'example-tool'];
  assert.throws(() => validateCatalog(catalog), /duplicate/);
  catalog.featuredDealIds = Array.from({ length: 7 }, (_, index) => `product-${index}`);
  assert.throws(() => validateCatalog(catalog), /more than 6/);
});

test('Markdown preserves links, uncertain validity, surrounding prose and unknown Latest', () => {
  const rendered = renderMarkdown(fixture(), markdown);
  assert.ok(rendered.startsWith('# Developer deals\n\nIntroduction and disclosure.\n'));
  assert.ok(rendered.endsWith('---\n\n## Disclaimer\n\nAffiliate disclosure.\n'));
  assert.ok(
    rendered.includes(
      '| [Example Tool](https://example.com/?ref=community&plan=annual) | A [useful tool](https://example.com/docs). | **SAVE30** - 30% off &#124; annual plans | Ends about Nov 30 |  |',
    ),
  );
  assert.equal(renderMarkdown(fixture(), rendered), rendered);
  const historical = fixture();
  historical.hasLatestColumn = false;
  assert.ok(!renderMarkdown(historical, markdown).includes('**Latest**'));
  assert.throws(
    () => renderMarkdown(fixture(), '# Missing category\n'),
    /missing or ambiguous heading/,
  );
});

test('README previews five deals per category and links to the full category on Ctrl Friday', () => {
  const catalog = fixture();
  const [example] = catalog.deals;
  catalog.deals = Array.from({ length: 6 }, (_, index) => ({
    ...example,
    id: `tool-${index + 1}`,
    name: `Tool ${index + 1}`,
  }));

  const readme = renderMarkdown(catalog, markdown);
  assert.match(
    readme,
    /\| \*\*Name\*\* \| \*\*Description\*\* \| \*\*Deal details\*\* \| \*\*Validity\*\* \| \*\*Latest\*\* \|/,
  );
  assert.deepEqual(
    readme.match(/^\| \[Tool \d\]/gm),
    [1, 2, 3, 4, 5].map((number) => `| [Tool ${number}]`),
  );
  assert.match(
    readme,
    /\| \[Tool 5\][^\n]+\n\n<!-- category-link -->\n\[View all Developer tools deals\]\(https:\/\/ctrlfriday\.com\/\?category=developer-tools&year=2026#deals\)/,
  );

  const archive = renderMarkdown({ ...catalog, source: 'archives/2025.md' }, markdown);
  assert.match(archive, /\| \[Tool 6\]/);
  assert.doesNotMatch(archive, /<!-- category-link -->/);

  catalog.deals.pop();
  assert.equal(renderMarkdown(catalog, readme), readme);
});

test('README navigation and sections follow the catalog category order', () => {
  const catalog = fixture();
  catalog.categories.unshift({ id: 'design-tools', name: 'Design tools', heading: 'Design' });
  const source = markdown
    .replace(
      '\n\n<!-- category-navigation:end -->',
      '\n- 🎨 [Design](#design) <!-- category:design-tools -->\n\n<!-- category-navigation:end -->',
    )
    .replace(
      '<!-- category-sections:end -->',
      '## Design\n\nDesign resources.\n\n| Name | Description | Deal | Validity | Latest |\n| :- | :- | :- | :- | :- |\n\n<!-- category-sections:end -->',
    );

  const readme = renderMarkdown(catalog, source);
  const categoryIds = catalog.categories.map(({ id }) => id);
  assert.deepEqual(
    [...readme.matchAll(/<!-- category:([a-z0-9-]+) -->/g)].map((match) => match[1]),
    categoryIds,
  );
  assert.deepEqual(
    [...readme.matchAll(/\?category=([a-z0-9-]+)&year=2026#deals/g)].map((match) => match[1]),
    categoryIds,
  );
  assert.match(readme, /^## Design\n\nDesign resources\.\n\n\| /m);
  assert.equal(renderMarkdown(catalog, readme), readme);
});

test('category ordering applies to Markdown and requires deals in that category', () => {
  const catalog = fixture();
  catalog.deals.push({ ...catalog.deals[0], id: 'second-tool', name: 'Second Tool' });
  catalog.categories[0].lastDealIds = ['example-tool'];
  assert.equal(validateCatalog(catalog), catalog);
  const rendered = renderMarkdown(catalog, markdown);
  assert.ok(rendered.indexOf('[Second Tool]') < rendered.indexOf('[Example Tool]'));

  catalog.categories[0].lastDealIds = ['missing-tool'];
  assert.throws(
    () => validateCatalog(catalog),
    /missing-tool is not listed in category developer-tools/,
  );
});

test('catalog files drive Markdown checks and static website exports', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'bfcm-data-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const catalog = { ...fixture(), featuredDealIds: ['example-tool'] };
  catalog.deals[0].faviconUrl = 'https://example.com/favicon.ico';
  await writeCatalogFixture(root, catalog);
  await writeFile(path.join(root, 'README.md'), markdown);
  const catalogs = await readCatalogs(root);
  await assert.rejects(syncMarkdown(catalogs, { root }), /out of sync/);
  assert.equal(await readFile(path.join(root, 'README.md'), 'utf8'), markdown);
  await syncMarkdown(catalogs, { root, write: true });
  assert.equal(await syncMarkdown(catalogs, { root }), 0);
  const categorySchemaPath = path.join(root, 'data/categories.json');
  const categorySchema = JSON.parse(await readFile(categorySchemaPath, 'utf8'));
  categorySchema.oneOf.find((category) => category.const === 'developer-tools').title =
    'Build tools';
  await writeFile(categorySchemaPath, JSON.stringify(categorySchema));
  await exportCatalogs(catalogs, root);
  const index = JSON.parse(await readFile(path.join(root, 'www/public/data/index.json'), 'utf8'));
  assert.equal(index.currentYear, 2026);
  assert.equal(index.catalogs[0].dealCount, 1);
  const exported = JSON.parse(await readFile(path.join(root, 'www/public/data/2026.json'), 'utf8'));
  assert.equal(exported.$schema, undefined);
  assert.deepEqual(exported.featuredDealIds, ['example-tool']);
  assert.equal(exported.deals[0].url, 'https://example.com/?ref=community&plan=annual');
  assert.equal(exported.deals[0].faviconUrl, 'https://example.com/favicon.ico');
  assert.equal(exported.deals[0].validity, 'Ends about Nov 30');
  const initial = JSON.parse(
    await readFile(path.join(root, 'www/src/data/initial-data.json'), 'utf8'),
  );
  assert.deepEqual(initial.catalog, exported);
  assert.deepEqual(initial.index, index);
  const categories = JSON.parse(
    await readFile(path.join(root, 'www/public/data/categories.json'), 'utf8'),
  );
  const sourceCategories = JSON.parse(
    await readFile(path.join(root, 'www/src/data/categories.json'), 'utf8'),
  );
  assert.deepEqual(sourceCategories, categories);
  assert.ok(
    categories.some(
      (category) => category.id === 'developer-tools' && category.name === 'Build tools',
    ),
  );
});

test('individual product files can be added, updated and removed without editing a catalog index', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'bfcm-products-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeCatalogFixture(root, fixture());

  const file = path.join(root, 'data/deals/2026/another-tool.json');
  const { id, ...product } = fixture().deals[0];
  product.name = 'Another Tool';
  await writeFile(file, JSON.stringify(product));

  const added = await readCatalogs(root);
  assert.deepEqual(
    added[0].deals.map((deal) => deal.id),
    ['another-tool', 'example-tool'],
  );

  product.offer = '40% off';
  await writeFile(file, JSON.stringify(product));
  const updated = await readCatalogs(root);
  assert.equal(updated[0].deals.find((deal) => deal.id === 'another-tool').offer, '40% off');

  await rm(file);
  const remaining = await readCatalogs(root);
  assert.deepEqual(
    remaining[0].deals.map((deal) => deal.id),
    ['example-tool'],
  );
});

test('deals sort by explicit order, then addedAt, then filename', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'bfcm-added-deals-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const catalog = fixture();
  const [deal] = catalog.deals;
  catalog.deals.push(
    { ...deal, id: 'curated-tool', order: 3 },
    { ...deal, id: 'z-added-first', addedAt: '2026-11-27T09:00:00+08:00', order: 1 },
    { ...deal, id: 'a-added-second', addedAt: '2026-11-27T01:30:00Z', order: 1 },
    { ...deal, id: 'b-added-second', addedAt: '2026-11-27T01:30:00Z', order: 1 },
    { ...deal, id: 'unordered-dated-tool', addedAt: '2026-11-26T00:00:00Z' },
  );
  await writeCatalogFixture(root, catalog);

  const [loaded] = await readCatalogs(root);
  assert.deepEqual(
    loaded.deals.map((deal) => deal.id),
    [
      'z-added-first',
      'a-added-second',
      'b-added-second',
      'curated-tool',
      'example-tool',
      'unordered-dated-tool',
    ],
  );
});

test('invalid product files report the filename and reject unknown categories', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'bfcm-invalid-product-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeCatalogFixture(root, fixture());

  const file = path.join(root, 'data/deals/2026/example-tool.json');
  const { id, ...product } = fixture().deals[0];
  product.categories = ['typo'];
  await writeFile(file, JSON.stringify(product));
  await assert.rejects(
    readCatalogs(root),
    /example-tool\.json: Unknown category: typo\. Choose one of:/,
  );

  product.categories = ['developer-tools'];
  await writeFile(file, JSON.stringify(product));
  await writeFile(path.join(root, 'data/deals/2026/Invalid Name.json'), JSON.stringify(product));
  await assert.rejects(
    readCatalogs(root),
    /Invalid Name\.json: use a lowercase, hyphen-separated product filename/,
  );
});
