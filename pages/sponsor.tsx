import initialData from '../src/data/initial-data.json';
import { SponsorPage } from '../src/components/sponsor-page';
import type { Catalog } from '../src/lib/types';

export default function SponsorRoute() {
  return <SponsorPage catalog={initialData.catalog as Catalog} />;
}
