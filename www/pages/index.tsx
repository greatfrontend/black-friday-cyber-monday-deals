import initialData from '../src/data/initial-data.json';
import { Directory } from '../src/components/directory';
import type { Catalog, CatalogIndex } from '../src/lib/types';
import type { Props } from './index.server';

export default function HomePage({ builtAt }: Props) {
  return (
    <Directory
      initialCatalog={initialData.catalog as Catalog}
      index={initialData.index as CatalogIndex}
      builtAt={builtAt}
    />
  );
}
