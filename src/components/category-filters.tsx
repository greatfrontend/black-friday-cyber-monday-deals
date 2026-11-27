import { useId, type ReactNode } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import {
  BookImage,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Ellipsis,
  GraduationCap,
  HeartPulse,
  LayoutGrid,
  LibraryBig,
  ListChecks,
  Megaphone,
  MessagesSquare,
  Package,
  PanelsTopLeft,
  PenTool,
  Presentation,
  Shapes,
  Share2,
  Sparkles,
  Terminal,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { Catalog, CatalogIndex, Filters } from '../lib/types';
import { categoryLabels } from '../lib/categories';
import { cn } from '../lib/utils';
import { Select } from './ui/select';

const categoryIcons: Partial<Record<string, LucideIcon>> = {
  'technical-interviews-preparation': MessagesSquare,
  'developer-courses': GraduationCap,
  'ui-kits-starter-kits': PanelsTopLeft,
  'developer-tools': Terminal,
  'books-for-developers-and-software-engineers': BookOpen,
  'ai-powered-tools-for-developers': Bot,
  'design-kits': Shapes,
  'design-courses': Presentation,
  'design-books': BookImage,
  'productivity-tools': ListChecks,
  'general-ai-tools': Sparkles,
  'design-tools': PenTool,
  'marketing-seo': Megaphone,
  'business-tools': BriefcaseBusiness,
  'social-media-tools': Share2,
  'finance-tools': Wallet,
  utilities: Wrench,
  'health-and-fitness': HeartPulse,
  miscellaneous: Ellipsis,
  'interview-preparation': MessagesSquare,
  'ui-kits-templates-boilerplates': PanelsTopLeft,
  'books-courses': LibraryBig,
};

const categoryButtonClassName = cn(
  'relative isolate flex min-h-8 w-full cursor-pointer items-center gap-[9px] rounded-full',
  'border border-transparent px-2.5 py-1 text-left text-sm text-foreground transition-colors',
  'duration-150 hover:bg-muted max-[850px]:min-h-[46px] max-[850px]:py-2 max-[850px]:text-base',
  'pointer-coarse:min-h-12 [&>svg]:shrink-0 [&>svg]:stroke-[1.5]',
);

interface CategoryFiltersProps {
  catalog: Catalog;
  index: CatalogIndex;
  filters: Filters;
  onChange: (changes: Partial<Filters>) => void;
  children?: ReactNode;
}

export function CategoryFilters({
  catalog,
  index,
  filters,
  onChange,
  children,
}: CategoryFiltersProps) {
  const selectionId = useId();
  return (
    <LayoutGroup id={selectionId}>
      <div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2.5">Categories</p>
          <div className="max-[850px]:space-y-1">
            <button
              type="button"
              aria-pressed={filters.category === 'all'}
              onClick={() => onChange({ category: 'all' })}
              className={cn(
                categoryButtonClassName,
                filters.category === 'all' &&
                  cn(
                    'bg-transparent font-semibold hover:bg-transparent forced-colors:text-[HighlightText]',
                    'forced-colors:outline forced-colors:outline-[Highlight]',
                  ),
              )}
            >
              {filters.category === 'all' && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-[inherit] bg-muted forced-colors:bg-[Highlight]"
                  layoutId="category"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <LayoutGrid className="size-4" aria-hidden="true" />
              <span className="grow">All deals</span>
              <span
                className={cn(
                  'text-sm font-normal text-muted-foreground tabular-nums in-aria-pressed:font-semibold',
                  'in-aria-pressed:text-foreground',
                )}
              >
                {catalog.deals.length}
              </span>
            </button>
            {catalog.categories.map((category) => {
              const Icon = categoryIcons[category.id] ?? Package;
              const count = catalog.deals.filter((deal) =>
                deal.categories.includes(category.id),
              ).length;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={filters.category === category.id}
                  onClick={() => onChange({ category: category.id })}
                  className={cn(
                    categoryButtonClassName,
                    filters.category === category.id &&
                      cn(
                        'bg-transparent font-semibold hover:bg-transparent forced-colors:text-[HighlightText]',
                        'forced-colors:outline forced-colors:outline-[Highlight]',
                      ),
                  )}
                >
                  {filters.category === category.id && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-[inherit] bg-muted forced-colors:bg-[Highlight]"
                      layoutId="category"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="grow">{categoryLabels[category.id] ?? category.name}</span>
                  <span
                    className={cn(
                      'text-sm font-normal text-muted-foreground tabular-nums in-aria-pressed:font-semibold',
                      'in-aria-pressed:text-foreground',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {children}
        <div className="mt-5 border-t border-border pt-4 max-[850px]:mt-7 max-[850px]:pt-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2.5" id="collection-label">
            Collection
          </p>
          <Select
            label="Choose collection year"
            value={String(filters.year)}
            items={[...index.catalogs].reverse().map(({ year }) => ({
              value: String(year),
              label: year === index.currentYear ? `${year} deals` : `${year} archive`,
            }))}
            onValueChange={(value) => onChange({ year: Number(value), category: 'all' })}
            className="w-full min-[851px]:pointer-fine:min-h-9"
          />
        </div>
      </div>
    </LayoutGroup>
  );
}
