import initialData from '../src/data/initial-data.json';
import { Directory } from '../src/components/directory';
import type { Catalog, CatalogIndex } from '../src/lib/types';

export default function HomePage() {
  return (
    <Directory
      initialCatalog={initialData.catalog as Catalog}
      index={initialData.index as CatalogIndex}
    />
  );
}
