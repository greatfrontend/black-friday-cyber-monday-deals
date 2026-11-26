import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './style.css';
import { MotionConfig } from 'motion/react';
import initialData from '../src/data/initial-data.json';
import { Directory } from '../src/components/directory';
import { TooltipProvider } from '../src/components/ui/tooltip';
import type { Catalog, CatalogIndex } from '../src/lib/types';

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider delay={450}>
        <Directory
          initialCatalog={initialData.catalog as Catalog}
          index={initialData.index as CatalogIndex}
        />
      </TooltipProvider>
    </MotionConfig>
  );
}
