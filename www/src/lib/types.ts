export interface Deal {
  id: string;
  name: string;
  url: string;
  faviconUrl?: string;
  categories: string[];
  description: string;
  offer: string;
  couponCodes: string[];
  validity: string;
  latest: boolean | null;
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  heading: string;
  lastDealIds?: string[];
}

export type SponsorSlot =
  | { dealId: string; logo: string; displayName?: string; house?: true }
  | { reserved: true };

export interface DealPlacement {
  dealId: string;
  afterDealId: string;
}

export interface Sponsorship {
  status: 'active' | 'ended';
  priceUsd: number;
  endsOn: string;
  checkoutUrl: string | null;
  contactEmail: string | null;
  slotCount: number;
  slots: SponsorSlot[];
}

export interface Catalog {
  year: number;
  title: string;
  description: string;
  lastChecked: string | null;
  featuredDealIds?: string[];
  allDealsPlacements?: DealPlacement[];
  sponsorship?: Sponsorship;
  categories: Category[];
  deals: Deal[];
}

export interface CatalogIndex {
  currentYear: number;
  catalogs: {
    year: number;
    title: string;
    lastChecked: string | null;
    dealCount: number;
    path: string;
  }[];
}

export interface Filters {
  query: string;
  category: string;
  year: number;
  sort: 'curated' | 'discount' | 'name';
  savedOnly: boolean;
}

export interface CopiedCoupon {
  year: number;
  dealId: string;
  code: string;
}
