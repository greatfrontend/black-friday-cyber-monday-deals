export interface Deal {
  id: string;
  name: string;
  url: string;
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
}

export interface Catalog {
  year: number;
  title: string;
  description: string;
  lastChecked: string | null;
  featuredDealIds?: string[];
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
  couponOnly: boolean;
  discountOnly: boolean;
}

export interface CopiedCoupon {
  year: number;
  dealId: string;
  code: string;
}
