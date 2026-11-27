import type { Catalog, Deal, Sponsorship } from './types';

export const sponsorPagePath = '/sponsor';

export type HeroSlot =
  | { kind: 'sponsor'; deal: Deal; logoUrl: string; displayName: string }
  | { kind: 'reserved' }
  | { kind: 'open' };

type SponsoredCatalog = Pick<Catalog, 'year' | 'deals' | 'sponsorship'>;

export function getActiveSponsorship(catalog: Pick<Catalog, 'sponsorship'>) {
  return catalog.sponsorship?.status === 'active' ? catalog.sponsorship : null;
}

export function getSponsorLogoUrl(year: number, logo: string) {
  return `/sponsors/${year}/${logo}`;
}

/** Sponsored deal IDs in slot order, which is the order sponsors paid in. */
export function getSponsoredDealIds(catalog: Pick<Catalog, 'sponsorship'>) {
  const slots = getActiveSponsorship(catalog)?.slots ?? [];
  return slots.flatMap((slot) => ('dealId' in slot ? [slot.dealId] : []));
}

export function pinSponsoredDeals(deals: Deal[], catalog: Pick<Catalog, 'sponsorship'>) {
  const sponsoredIds = getSponsoredDealIds(catalog);
  if (sponsoredIds.length === 0) return deals;

  const sponsored = sponsoredIds.flatMap((id) => deals.find((deal) => deal.id === id) ?? []);
  const organic = deals.filter((deal) => !sponsoredIds.includes(deal.id));

  return [...sponsored, ...organic];
}

/** One entry per slot, so the hero always shows the full row including open slots. */
export function getHeroSlots(catalog: SponsoredCatalog): HeroSlot[] {
  const sponsorship = getActiveSponsorship(catalog);
  if (!sponsorship) return [];

  const deals = new Map(catalog.deals.map((deal) => [deal.id, deal]));
  const taken = sponsorship.slots.map((slot): HeroSlot => {
    if (!('dealId' in slot)) return { kind: 'reserved' };
    const deal = deals.get(slot.dealId);
    if (!deal) return { kind: 'reserved' };
    return {
      kind: 'sponsor',
      deal,
      logoUrl: getSponsorLogoUrl(catalog.year, slot.logo),
      displayName: slot.displayName ?? deal.name,
    };
  });
  const open = Array.from(
    { length: Math.max(0, sponsorship.slotCount - taken.length) },
    (): HeroSlot => ({ kind: 'open' }),
  );

  return [...taken, ...open];
}

export function getSlotAvailability(sponsorship: Sponsorship) {
  const houseSlots = sponsorship.slots.filter((slot) => 'house' in slot && slot.house).length;

  return {
    forSale: sponsorship.slotCount - houseSlots,
    open: Math.max(0, sponsorship.slotCount - sponsorship.slots.length),
  };
}

export function formatSlotAvailability(sponsorship: Sponsorship) {
  const { open } = getSlotAvailability(sponsorship);
  return `${open} ${open === 1 ? 'slot' : 'slots'} remaining`;
}
