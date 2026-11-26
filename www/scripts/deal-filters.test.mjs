import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterDeals,
  getDiscount,
  getOfferLabel,
  getDealKey,
  getFeaturedDeals,
} from '../src/lib/deals.ts';
import { getFaviconUrl } from '../src/lib/favicon.ts';

const filters = {
  query: '',
  category: 'all',
  year: 2026,
  sort: 'curated',
  savedOnly: false,
  couponOnly: false,
  discountOnly: false,
};
const catalog = {
  year: 2026,
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
      categories: ['courses'],
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

test('category, coupon, discount and saved filters combine without including other years', () => {
  const combined = {
    ...filters,
    category: 'developer-tools',
    couponOnly: true,
    discountOnly: true,
    savedOnly: true,
  };
  assert.equal(filterDeals(catalog, combined, [getDealKey(2025, 'tools')]).length, 0);
  assert.deepEqual(
    filterDeals(catalog, combined, [getDealKey(2026, 'tools')]).map((deal) => deal.id),
    ['tools'],
  );
  assert.equal(
    filterDeals(catalog, { ...filters, category: 'courses', couponOnly: true }, []).length,
    0,
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

test('favicon URLs omit referral paths and reject unsupported URL schemes', () => {
  const source = new URL(getFaviconUrl('https://example.com/pricing?ref=community#plans'));
  assert.equal(source.origin, 'https://www.google.com');
  assert.equal(source.searchParams.get('domain_url'), 'https://example.com');
  assert.equal(source.searchParams.get('sz'), '64');
  assert.equal(getFaviconUrl('not a URL'), null);
  assert.equal(getFaviconUrl('javascript:alert(1)'), null);
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
