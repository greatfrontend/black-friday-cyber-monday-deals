import { categoryLabels } from './categories.ts';
import type { Catalog, Deal, Filters } from './types';

export const repositoryUrl = 'https://github.com/greatfrontend/black-friday-cyber-monday-deals';

export function plainText(value: string) {
  return value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
}

export function getDiscount(offer: string) {
  const match = plainText(offer).match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
}

export function getOfferLabel(offer: string) {
  const discount = getDiscount(offer);
  if (discount === null) return 'Special pricing';
  return `${/up to/i.test(offer) ? 'Up to ' : ''}${discount}% off`;
}

export function getDealKey(year: number, id: string) {
  return `${year}/${id}`;
}

export function filterDeals(catalog: Catalog, filters: Filters, saved: string[]) {
  const words = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matching = catalog.deals.filter((deal) => {
    if (filters.category !== 'all' && !deal.categories.includes(filters.category)) return false;
    if (filters.savedOnly && !saved.includes(getDealKey(catalog.year, deal.id))) return false;
    if (filters.couponOnly && deal.couponCodes.length === 0) return false;
    if (filters.discountOnly && (getDiscount(deal.offer) ?? 0) < 50) return false;

    const searchText = plainText(
      [
        deal.name,
        deal.description,
        deal.offer,
        ...deal.couponCodes,
        ...deal.categories.map((category) => categoryLabels[category] ?? category),
      ].join(' '),
    ).toLocaleLowerCase();

    return words.every((word) => searchText.includes(word));
  });

  if (filters.sort === 'name') matching.sort((a, b) => a.name.localeCompare(b.name));
  if (filters.sort === 'discount')
    matching.sort((a, b) => (getDiscount(b.offer) ?? -1) - (getDiscount(a.offer) ?? -1));
  return matching;
}

export function formatCheckedDate(value: string | null) {
  if (!value) return 'Checking date not recorded';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export function buildSuggestionUrl(deal: Deal | undefined, year: number) {
  const params = new URLSearchParams({
    template: 'deal.yml',
    action: deal ? 'Update a deal' : 'Add a deal',
    product: deal?.name ?? '',
    year: String(year),
  });
  if (deal) {
    params.set('title', `[Deal] Update ${deal.name}`);
    params.set('url', deal.url);
    params.set('category', deal.categories.join(', '));
    params.set('offer', `${plainText(deal.description)}\n\n${plainText(deal.offer)}`);
    params.set('validity', deal.validity);
  }
  return `${repositoryUrl}/issues/new?${params}`;
}

export function getFeaturedDeals(catalog: Pick<Catalog, 'deals' | 'featuredDealIds'>) {
  if (!catalog.featuredDealIds) return catalog.deals.slice(0, 6);
  const products = new Map(catalog.deals.map((deal) => [deal.id, deal]));
  return catalog.featuredDealIds.flatMap((id) => products.get(id) ?? []);
}
