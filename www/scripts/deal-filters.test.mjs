import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryLabels, normalizeCategoryId } from '../src/lib/categories.ts';
import {
  filterDeals,
  getDiscount,
  getOfferLabel,
  getDealKey,
  getFeaturedDeals,
} from '../src/lib/deals.ts';
import { getFaviconUrl } from '../src/lib/favicon.ts';
import {
  formatSlotAvailability,
  getHeroSlots,
  getSlotAvailability,
  getSponsoredDealIds,
} from '../src/lib/sponsors.ts';

const filters = {
  query: '',
  category: 'all',
  year: 2026,
  sort: 'curated',
  savedOnly: false,
};
const catalog = {
  year: 2026,
  categories: [
    { id: 'developer-tools', name: 'Developer tools', heading: 'Developer tools' },
    { id: 'developer-courses', name: 'Developer courses', heading: 'Developer courses' },
  ],
  deals: [
    {
      id: 'tools',
      name: 'Build Tools',
      categories: ['developer-tools'],
      description: 'Work with **React**.',
      offer: 'Up to 60% off',
      couponCodes: ['BUILD60'],
    },
    {
      id: 'course',
      name: 'A React Course',
      categories: ['developer-courses'],
      description: 'Learn accessible interfaces.',
      offer: '$99 (was $199)',
      couponCodes: [],
    },
    {
      id: 'editor',
      name: 'Editor',
      categories: ['developer-tools'],
      description: 'A focused coding environment.',
      offer: '30% off annual plans',
      couponCodes: ['EDIT30'],
    },
  ],
};

test('search matches all query words across product content, categories, and coupon codes', () => {
  assert.deepEqual(
    filterDeals(catalog, { ...filters, query: 'REACT build60' }, []).map((deal) => deal.id),
    ['tools'],
  );
  assert.deepEqual(
    filterDeals(catalog, { ...filters, query: 'developer tools' }, []).map((deal) => deal.id),
    ['tools', 'editor'],
  );
  assert.equal(filterDeals(catalog, { ...filters, query: 'unmatched' }, []).length, 0);
});

test('category and saved filters combine without including other years', () => {
  const combined = {
    ...filters,
    category: 'developer-tools',
    savedOnly: true,
  };
  assert.equal(filterDeals(catalog, combined, [getDealKey(2025, 'tools')]).length, 0);
  assert.deepEqual(
    filterDeals(catalog, combined, [getDealKey(2026, 'tools'), getDealKey(2026, 'course')]).map(
      (deal) => deal.id,
    ),
    ['tools'],
  );
});

test('legacy category IDs resolve to the renamed catalog categories', () => {
  const courses = normalizeCategoryId('courses');
  const aiTools = normalizeCategoryId('ai-tools');
  assert.equal(courses, 'developer-courses');
  assert.equal(aiTools, 'general-ai-tools');
  assert.equal(categoryLabels[courses], 'Developer courses');
  assert.equal(categoryLabels[aiTools], 'AI tools');
  assert.equal(normalizeCategoryId('design-courses'), 'design-courses');
  assert.deepEqual(
    filterDeals(catalog, { ...filters, category: courses }, []).map((deal) => deal.id),
    ['course'],
  );
});

test('sorting does not mutate the source catalog or invent discounts from prices', () => {
  assert.deepEqual(
    filterDeals(catalog, { ...filters, sort: 'discount' }, []).map((deal) => deal.id),
    ['tools', 'editor', 'course'],
  );
  assert.deepEqual(
    filterDeals(catalog, { ...filters, sort: 'name' }, []).map((deal) => deal.id),
    ['course', 'tools', 'editor'],
  );
  assert.deepEqual(
    catalog.deals.map((deal) => deal.id),
    ['tools', 'course', 'editor'],
  );
  assert.equal(getDiscount('$99 (was $199)'), null);
  assert.equal(getOfferLabel('$99 (was $199)'), 'Special pricing');
  assert.equal(getDiscount('30% off plans, 51% off the bundle'), 30);
  assert.equal(getOfferLabel('Up to 60% off'), 'Up to 60% off');
});

test('category ordering moves selected deals to the end of that category’s curated order', () => {
  const ordered = {
    ...catalog,
    categories: [{ ...catalog.categories[0], lastDealIds: ['tools'] }, catalog.categories[1]],
  };
  const category = { ...filters, category: 'developer-tools' };
  assert.deepEqual(
    filterDeals(ordered, category, []).map((deal) => deal.id),
    ['editor', 'tools'],
  );
  assert.deepEqual(
    filterDeals(ordered, { ...category, sort: 'name' }, []).map((deal) => deal.id),
    ['tools', 'editor'],
  );
  assert.deepEqual(
    filterDeals(ordered, filters, []).map((deal) => deal.id),
    ['tools', 'course', 'editor'],
  );
});

test('all deals placements follow the anchor in the default order', () => {
  const placed = {
    ...catalog,
    allDealsPlacements: [{ dealId: 'tools', afterDealId: 'course' }],
  };
  assert.deepEqual(
    filterDeals(placed, filters, []).map((deal) => deal.id),
    ['course', 'tools', 'editor'],
  );
  assert.deepEqual(
    filterDeals(placed, { ...filters, query: 'developer tools' }, []).map((deal) => deal.id),
    ['tools', 'editor'],
  );
  assert.deepEqual(
    filterDeals(placed, { ...filters, category: 'developer-tools' }, []).map((deal) => deal.id),
    ['tools', 'editor'],
  );
  assert.deepEqual(
    filterDeals(placed, { ...filters, sort: 'discount' }, []).map((deal) => deal.id),
    ['tools', 'editor', 'course'],
  );
});

test('favicon URLs omit referral paths and reject unsupported URL schemes', () => {
  const source = new URL(getFaviconUrl('https://example.com/pricing?ref=community#plans'));
  assert.equal(source.origin, 'https://www.google.com');
  assert.equal(source.searchParams.get('domain_url'), 'https://example.com');
  assert.equal(source.searchParams.get('sz'), '64');
  assert.equal(getFaviconUrl('not a URL'), null);
  assert.equal(getFaviconUrl('javascript:alert(1)'), null);
});

const sponsorship = {
  status: 'active',
  priceUsd: 199,
  endsOn: '2026-12-31',
  checkoutUrl: null,
  contactEmail: null,
  slotCount: 9,
  slots: [
    { dealId: 'editor', logo: 'editor.svg', displayName: 'Editor', house: true },
    { reserved: true },
    { dealId: 'course', logo: 'course.png' },
  ],
};

test('sponsored deals lead the default order in slot order and yield to explicit sorts', () => {
  const sponsored = { ...catalog, sponsorship };
  assert.deepEqual(
    filterDeals(sponsored, filters, []).map((deal) => deal.id),
    ['editor', 'course', 'tools'],
  );
  assert.deepEqual(
    filterDeals(sponsored, { ...filters, category: 'developer-tools' }, []).map((deal) => deal.id),
    ['editor', 'tools'],
  );
  assert.deepEqual(
    filterDeals(sponsored, { ...filters, sort: 'name' }, []).map((deal) => deal.id),
    ['course', 'tools', 'editor'],
  );
  assert.deepEqual(
    filterDeals({ ...catalog, sponsorship: { ...sponsorship, status: 'ended' } }, filters, []).map(
      (deal) => deal.id,
    ),
    ['tools', 'course', 'editor'],
  );
});

test('hero slots cover every slot, showing reserved and open ones after sponsors', () => {
  const slots = getHeroSlots({ ...catalog, sponsorship });
  assert.deepEqual(
    slots.map((slot) => slot.kind),
    ['sponsor', 'reserved', 'sponsor', 'open', 'open', 'open', 'open', 'open', 'open'],
  );
  assert.equal(slots[0].deal.id, 'editor');
  assert.equal(slots[0].displayName, 'Editor');
  assert.equal(slots[2].displayName, slots[2].deal.name);
  assert.equal(slots[2].logoUrl, '/sponsors/2026/course.png');
  assert.deepEqual(getSponsoredDealIds({ sponsorship }), ['editor', 'course']);
  assert.deepEqual(getSlotAvailability(sponsorship), { forSale: 8, open: 6 });
  assert.equal(formatSlotAvailability(sponsorship), '6 slots remaining');
  assert.equal(
    formatSlotAvailability({ ...sponsorship, slots: Array(8).fill({ reserved: true }) }),
    '1 slot remaining',
  );
  assert.equal(
    formatSlotAvailability({ ...sponsorship, slots: Array(9).fill({ reserved: true }) }),
    '0 slots remaining',
  );
  assert.deepEqual(getHeroSlots(catalog), []);
  assert.deepEqual(
    getHeroSlots({ ...catalog, sponsorship: { ...sponsorship, status: 'ended' } }),
    [],
  );
});

test('hero previews follow the curated order and support catalogs without curation', () => {
  assert.deepEqual(
    getFeaturedDeals({ ...catalog, featuredDealIds: ['editor', 'tools'] }).map((deal) => deal.id),
    ['editor', 'tools'],
  );
  assert.deepEqual(
    getFeaturedDeals(catalog).map((deal) => deal.id),
    ['tools', 'course', 'editor'],
  );
});
