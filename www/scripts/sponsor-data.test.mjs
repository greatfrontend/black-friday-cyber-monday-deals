import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { exportCatalogs, readCatalogs, syncMarkdown } from './deal-data.mjs';
import { validateCatalog, validateSponsorship } from './deal-validation.mjs';
import { renderMarkdown } from './deal-markdown.mjs';

function product(name) {
  return {
    name,
    url: 'https://example.com/?ref=community&plan=annual',
    categories: ['developer-tools'],
    description: 'A useful tool.',
    offer: '30% off annual plans',
    couponCodes: [],
    validity: 'Ends Nov 30',
    latest: null,
  };
}

function sponsorshipFile() {
  return {
    $schema: '../sponsorship.schema.json',
    year: 2026,
    status: 'active',
    priceUsd: 199,
    endsOn: '2026-12-31',
    checkoutUrl: null,
    contactEmail: null,
    slots: [
      { dealId: 'house-tool', logo: 'house-tool.svg', house: true },
      { dealId: 'example-tool', logo: 'example-tool.png' },
      { reserved: true },
    ],
  };
}

// The shape a catalog carries after its sponsorship file has been read.
function sponsoredCatalog() {
  const { $schema, year, ...sponsorship } = sponsorshipFile();

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
      { id: 'house-tool', ...product('House Tool') },
      { id: 'example-tool', ...product('Example <Tool>') },
    ],
    sponsorship: { ...sponsorship, slotCount: 9 },
  };
}

const markdown =
  '# Developer deals\n\n<!-- sponsors:start -->\n<!-- sponsors:end -->\n\n## Tools\n\n| Name | Description | Deal | Validity | Latest |\n| :- | :- | :- | :- | :- |\n';

async function writeRepositoryFixture(root, { logoBytes = 64 } = {}) {
  const { deals, sponsorship, ...metadata } = sponsoredCatalog();
  await mkdir(path.join(root, 'data/catalogs'), { recursive: true });
  await mkdir(path.join(root, 'data/deals/2026'), { recursive: true });
  await mkdir(path.join(root, 'data/sponsors'), { recursive: true });
  await mkdir(path.join(root, 'assets/sponsors/2026'), { recursive: true });
  await writeFile(
    path.join(root, 'data/categories.json'),
    await readFile(new URL('../../data/categories.json', import.meta.url), 'utf8'),
  );
  await writeFile(path.join(root, 'data/catalogs/2026.json'), JSON.stringify(metadata));
  await writeFile(path.join(root, 'data/sponsors/2026.json'), JSON.stringify(sponsorshipFile()));
  await writeFile(path.join(root, 'README.md'), markdown);

  for (const { id, ...fields } of deals) {
    await writeFile(path.join(root, 'data/deals/2026', `${id}.json`), JSON.stringify(fields));
  }

  await writeFile(path.join(root, 'assets/sponsors/2026/house-tool.svg'), '<svg/>');
  await writeFile(path.join(root, 'assets/sponsors/2026/example-tool.png'), 'x'.repeat(logoBytes));
}

test('sponsorship files reject malformed settings and slots', () => {
  assert.equal(validateSponsorship(sponsorshipFile()).slots.length, 3);
  const full = {
    ...sponsorshipFile(),
    slots: Array.from({ length: 9 }, () => ({ reserved: true })),
  };
  assert.equal(validateSponsorship(full).slots.length, 9);

  for (const [patch, error] of [
    [{ status: 'paused' }, /\/status/],
    [{ priceUsd: 0 }, /\/priceUsd/],
    [{ endsOn: '2026-02-30' }, /calendar-date/],
    [{ checkoutUrl: 'javascript:alert(1)' }, /web-url/],
    [{ contactEmail: 'not an address' }, /\/contactEmail/],
    [{ slots: Array.from({ length: 10 }, () => ({ reserved: true })) }, /more than 9/],
    [{ slots: [{ dealId: 'example-tool', logo: 'example-tool.gif' }] }, /\/slots\/0/],
    [{ slots: [{ dealId: 'example-tool' }] }, /\/slots\/0/],
    [{ slots: [{ dealId: 'example-tool', logo: 'example-tool.svg', paid: true }] }, /\/slots\/0/],
    [{ slots: [{ reserved: false }] }, /\/slots\/0/],
  ]) {
    assert.throws(() => validateSponsorship({ ...sponsorshipFile(), ...patch }), error);
  }
});

test('sponsors must be catalog deals, listed once, with a logo named after the deal', () => {
  assert.doesNotThrow(() => validateCatalog(sponsoredCatalog()));

  for (const [slots, error] of [
    [[{ dealId: 'missing-tool', logo: 'missing-tool.svg' }], /sponsor missing-tool does not exist/],
    [[{ dealId: 'example-tool', logo: 'another-tool.svg' }], /must be named after example-tool/],
    [
      [
        { dealId: 'example-tool', logo: 'example-tool.svg' },
        { dealId: 'example-tool', logo: 'example-tool.svg' },
      ],
      /Duplicate sponsor: example-tool/,
    ],
    [
      [
        { dealId: 'house-tool', logo: 'house-tool.svg', house: true },
        { dealId: 'example-tool', logo: 'example-tool.svg', house: true },
      ],
      /only one house sponsor/,
    ],
  ]) {
    const catalog = sponsoredCatalog();
    catalog.sponsorship.slots = slots;
    assert.throws(() => validateCatalog(catalog), error);
  }
});

test('the README sponsor block is generated between its markers and stays stable', () => {
  const rendered = renderMarkdown(sponsoredCatalog(), markdown);
  assert.ok(rendered.includes('<!-- sponsors:start -->\n\n## Sponsors\n\n<table>'));
  assert.ok(
    rendered.includes(
      '<a href="https://example.com/?ref=community&amp;plan=annual"><img src="assets/sponsors/2026/example-tool.png" alt="" width="56" height="56"><br><strong>Example &lt;Tool&gt;</strong></a>',
    ),
  );
  assert.ok(rendered.indexOf('House Tool') < rendered.indexOf('Example &lt;Tool&gt;'));
  assert.ok(
    rendered.includes(
      '**6 slots remaining** at $199 each, live until 31 Dec 2026. [Become a sponsor](SPONSORS.md).\n\n<!-- sponsors:end -->',
    ),
  );
  assert.equal(renderMarkdown(sponsoredCatalog(), rendered), rendered);

  const archived = sponsoredCatalog();
  archived.source = 'archives/2026.md';
  const archivedBlock = renderMarkdown(archived, markdown);
  assert.ok(archivedBlock.includes('src="../assets/sponsors/2026/house-tool.svg"'));
  assert.ok(archivedBlock.includes('[Become a sponsor](../SPONSORS.md)'));

  const limited = sponsoredCatalog();
  limited.sponsorship.slots.push(...Array.from({ length: 5 }, () => ({ reserved: true })));
  assert.ok(renderMarkdown(limited, markdown).includes('**1 slot remaining**'));
  limited.sponsorship.slots.push({ reserved: true });
  assert.ok(renderMarkdown(limited, markdown).includes('0 slots remaining.'));

  const ended = sponsoredCatalog();
  ended.sponsorship.status = 'ended';
  assert.ok(
    renderMarkdown(ended, rendered).includes('<!-- sponsors:start -->\n<!-- sponsors:end -->'),
  );

  assert.throws(
    () => renderMarkdown(sponsoredCatalog(), markdown.replace('<!-- sponsors:end -->', '')),
    /README\.md: add <!-- sponsors:start -->/,
  );

  const unsponsored = sponsoredCatalog();
  delete unsponsored.sponsorship;
  assert.ok(!renderMarkdown(unsponsored, markdown).includes('## Sponsors'));
});

test('sponsorship files are read with the catalog and exported with their logos', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'bfcm-sponsors-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeRepositoryFixture(root);

  const catalogs = await readCatalogs(root);
  assert.equal(catalogs[0].sponsorship.slotCount, 9);
  assert.equal(catalogs[0].sponsorship.year, undefined);
  assert.equal(catalogs[0].sponsorship.$schema, undefined);

  await assert.rejects(syncMarkdown(catalogs, { root }), /out of sync/);
  await syncMarkdown(catalogs, { root, write: true });
  assert.equal(await syncMarkdown(catalogs, { root }), 0);

  await exportCatalogs(catalogs, root);
  const exported = JSON.parse(await readFile(path.join(root, 'www/public/data/2026.json'), 'utf8'));
  assert.deepEqual(exported.sponsorship, catalogs[0].sponsorship);
  const initial = JSON.parse(
    await readFile(path.join(root, 'www/src/data/initial-data.json'), 'utf8'),
  );
  assert.deepEqual(initial.catalog.sponsorship, exported.sponsorship);
  assert.equal(
    await readFile(path.join(root, 'www/public/sponsors/2026/house-tool.svg'), 'utf8'),
    '<svg/>',
  );

  await rm(path.join(root, 'data/sponsors/2026.json'));
  const unsponsored = await readCatalogs(root);
  assert.equal(unsponsored[0].sponsorship, undefined);
});

test('sponsor logos must exist, stay small, and match the sponsorship year', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'bfcm-sponsor-logos-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeRepositoryFixture(root, { logoBytes: 100 * 1024 + 1 });
  await assert.rejects(
    readCatalogs(root),
    /2026\.json: sponsor logo example-tool\.png must be 100 KB or smaller/,
  );

  await rm(path.join(root, 'assets/sponsors/2026/example-tool.png'));
  await assert.rejects(readCatalogs(root), /sponsor logo example-tool\.png is missing/);

  await writeRepositoryFixture(root);
  await writeFile(
    path.join(root, 'data/sponsors/2026.json'),
    JSON.stringify({ ...sponsorshipFile(), year: 2025 }),
  );
  await assert.rejects(readCatalogs(root), /filename must match sponsorship\.year/);
});
