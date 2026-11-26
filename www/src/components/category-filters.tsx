import { useId } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import {
  Bot,
  BookOpen,
  Boxes,
  Code2,
  GraduationCap,
  LayoutGrid,
  Palette,
  PenTool,
  Terminal,
  Wrench,
} from 'lucide-react';
import type { Catalog, CatalogIndex, Filters } from '../lib/types';
import { categoryLabels } from '../lib/categories';
import { cn } from '../lib/utils';
import { Select } from './ui/select';

const icons = {
  'technical-interviews-preparation': Terminal,
  'interview-preparation': Terminal,
  courses: GraduationCap,
  'ui-kits-starter-kits': Boxes,
  'ui-kits-templates-boilerplates': Boxes,
  'developer-tools': Code2,
  'books-for-developers-and-software-engineers': BookOpen,
  'books-courses': BookOpen,
  'ai-powered-tools-for-developers': Bot,
  'ai-tools': Bot,
  'design-kits': Palette,
  'design-courses': PenTool,
  'productivity-tools': Wrench,
};

interface CategoryFiltersProps {
  catalog: Catalog;
  index: CatalogIndex;
  filters: Filters;
  onChange: (changes: Partial<Filters>) => void;
}

export function CategoryFilters({ catalog, index, filters, onChange }: CategoryFiltersProps) {
  const selectionId = useId();
  return (
    <LayoutGroup id={selectionId}>
      <div>
        <div className="mb-7">
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
            className="w-full"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2.5">Categories</p>
          <div className="space-y-1">
            <button
              type="button"
              aria-pressed={filters.category === 'all'}
              onClick={() => onChange({ category: 'all' })}
              className={cn(
                'relative isolate flex min-h-11 w-full cursor-pointer items-center gap-[9px] rounded',
                'border border-transparent px-2.5 py-2 text-left text-sm text-foreground transition-colors',
                'duration-150 hover:bg-muted max-[850px]:min-h-[46px] max-[850px]:text-base',
                'pointer-coarse:min-h-12 [&>svg]:shrink-0 [&>svg]:stroke-[1.5]',
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
              const Icon = icons[category.id as keyof typeof icons] ?? Boxes;
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
                    'relative isolate flex min-h-11 w-full cursor-pointer items-center gap-[9px] rounded',
                    'border border-transparent px-2.5 py-2 text-left text-sm text-foreground transition-colors',
                    'duration-150 hover:bg-muted max-[850px]:min-h-[46px] max-[850px]:text-base',
                    'pointer-coarse:min-h-12 [&>svg]:shrink-0 [&>svg]:stroke-[1.5]',
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
        <fieldset className="mt-7 border-t border-border pt-6">
          <legend className="sr-only">Offer filters</legend>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Offer type</p>
          <label
            className={cn(
              'flex min-h-[38px] cursor-pointer items-center gap-[9px] text-sm text-muted-foreground',
              'max-[850px]:min-h-[46px] max-[850px]:text-base pointer-coarse:min-h-12 [&>input]:size-3.5',
              '[&>input]:border [&>input]:border-border-strong [&>input]:accent-ring',
            )}
          >
            <input
              type="checkbox"
              checked={filters.couponOnly}
              onChange={(event) => onChange({ couponOnly: event.target.checked })}
            />
            <span>Has a coupon code</span>
          </label>
          <label
            className={cn(
              'flex min-h-[38px] cursor-pointer items-center gap-[9px] text-sm text-muted-foreground',
              'max-[850px]:min-h-[46px] max-[850px]:text-base pointer-coarse:min-h-12 [&>input]:size-3.5',
              '[&>input]:border [&>input]:border-border-strong [&>input]:accent-ring',
            )}
          >
            <input
              type="checkbox"
              checked={filters.discountOnly}
              onChange={(event) => onChange({ discountOnly: event.target.checked })}
            />
            <span>50% off or more</span>
          </label>
        </fieldset>
      </div>
    </LayoutGroup>
  );
}
