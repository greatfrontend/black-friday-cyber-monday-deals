import { Bookmark, Grid2X2, Link2, List, Search, SlidersHorizontal } from 'lucide-react';
import { useId, type RefObject } from 'react';
import { LayoutGroup, motion } from 'motion/react';
import type { Filters } from '../lib/types';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Select } from './ui/select';
import { Tooltip } from './ui/tooltip';

interface DirectoryControlsProps {
  filters: Filters;
  onChange: (changes: Partial<Filters>) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  dealCount?: number;
  savedCount: number;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  onOpenFilters: () => void;
  filtersOpen: boolean;
  onCopyLink: () => void;
}

export function DirectoryControls({
  filters,
  onChange,
  searchRef,
  dealCount,
  savedCount,
  view,
  onViewChange,
  onOpenFilters,
  filtersOpen,
  onCopyLink,
}: DirectoryControlsProps) {
  const selectionId = useId();
  return (
    <LayoutGroup id={selectionId}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="deals-heading"
              tabIndex={-1}
              className="text-xl leading-[1.3] font-medium tracking-tight"
            >
              Browse deals
            </h2>
          </div>
          <Tooltip label="Copy a link to these filters">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Copy a link to these filters"
              onClick={() => onCopyLink()}
            >
              <Link2 aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
        <search aria-label="Search and filter deals" className="flex gap-2">
          <div
            className={cn(
              'flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-border',
              'bg-surface pr-2.5 pl-3.5 transition-[border-color,box-shadow] hover:border-border-strong/60',
              'focus-within:outline-1 focus-within:outline-ring',
              'max-[600px]:gap-2 max-[600px]:pr-2 max-[600px]:pl-3',
            )}
          >
            <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="deal-search" className="sr-only">
              Search deals
            </label>
            <input
              ref={searchRef}
              id="deal-search"
              className={cn(
                'w-full min-w-0 border-0 bg-transparent py-2.5 text-base text-foreground outline-none',
                'placeholder:text-muted-foreground focus-visible:outline-none',
                'max-[600px]:placeholder:text-sm',
              )}
              type="search"
              name="q"
              value={filters.query}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="none"
              placeholder="Search deals…"
              onChange={(event) => onChange({ query: event.target.value })}
            />
            <span
              className={cn(
                'grid h-6 w-[23px] shrink-0 place-items-center rounded border border-border font-mono',
                'text-sm text-muted-foreground max-[600px]:hidden',
              )}
              aria-hidden="true"
            >
              /
            </span>
          </div>
          <Button
            variant="outline"
            className="gap-1.5 px-2.5 text-sm min-[851px]:hidden"
            aria-expanded={filtersOpen}
            aria-controls="deal-filters"
            aria-haspopup="dialog"
            onClick={() => onOpenFilters()}
          >
            <SlidersHorizontal aria-hidden="true" />
            Filters
            {filters.category !== 'all' && (
              <span className="grid size-[18px] place-items-center rounded bg-brand text-sm text-brand-foreground">
                1
              </span>
            )}
          </Button>
        </search>
        <div className="flex flex-wrap items-center justify-between gap-3 max-[359px]:items-start">
          <div className="relative flex items-center gap-0.5 self-center rounded-full bg-muted p-[3px] max-[359px]:w-full">
            <button
              type="button"
              aria-pressed={!filters.savedOnly}
              className={cn(
                'relative isolate flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5',
                'text-[13px] font-medium whitespace-nowrap text-muted-foreground max-[700px]:px-2',
                'pointer-coarse:before:absolute pointer-coarse:before:inset-x-0',
                "pointer-coarse:before:-inset-y-[5px] pointer-coarse:before:content-['']",
                '[&>span:not([aria-hidden])]:rounded [&>span:not([aria-hidden])]:px-[3px]',
                '[&>span:not([aria-hidden])]:py-px [&>span:not([aria-hidden])]:text-xs',
                '[&>span:not([aria-hidden])]:tabular-nums',
                !filters.savedOnly &&
                  'font-semibold text-foreground forced-colors:text-[HighlightText]',
              )}
              onClick={() => onChange({ savedOnly: false })}
            >
              {!filters.savedOnly && (
                <motion.span
                  className="absolute inset-0 -z-10 rounded-[inherit] bg-surface shadow-[0_1px_3px_#00000010] forced-colors:bg-[Highlight]"
                  aria-hidden="true"
                  layoutId="collection"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              All deals<span>{dealCount ?? '—'}</span>
            </button>
            <button
              type="button"
              aria-pressed={filters.savedOnly}
              className={cn(
                'relative isolate flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5',
                'text-[13px] font-medium whitespace-nowrap text-muted-foreground max-[700px]:px-2',
                'pointer-coarse:before:absolute pointer-coarse:before:inset-x-0',
                "pointer-coarse:before:-inset-y-[5px] pointer-coarse:before:content-['']",
                '[&>span:not([aria-hidden])]:rounded [&>span:not([aria-hidden])]:px-[3px]',
                '[&>span:not([aria-hidden])]:py-px [&>span:not([aria-hidden])]:text-xs',
                '[&>span:not([aria-hidden])]:tabular-nums',
                filters.savedOnly &&
                  'font-semibold text-foreground forced-colors:text-[HighlightText]',
              )}
              onClick={() => onChange({ savedOnly: true })}
            >
              {filters.savedOnly && (
                <motion.span
                  className="absolute inset-0 -z-10 rounded-[inherit] bg-surface shadow-[0_1px_3px_#00000010] forced-colors:bg-[Highlight]"
                  aria-hidden="true"
                  layoutId="collection"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <Bookmark className="size-3.5" aria-hidden="true" />
              Saved<span>{savedCount}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 max-[359px]:w-full max-[359px]:justify-end">
            <Select
              label="Sort deals"
              value={filters.sort}
              items={[
                { value: 'curated', label: 'Default order' },
                { value: 'discount', label: 'Biggest discount' },
                { value: 'name', label: 'Name: A–Z' },
              ]}
              onValueChange={(value) => onChange({ sort: value as typeof filters.sort })}
              className={cn(
                'min-h-9 border-0 bg-transparent px-[7px] text-sm max-[600px]:min-h-[42px]',
                'max-[600px]:max-w-[140px] max-[600px]:gap-1.5 max-[600px]:px-0',
              )}
            />
            <div
              className="flex gap-0.5 rounded-full bg-muted p-[3px] max-[600px]:hidden"
              aria-label="Display layout"
            >
              <Tooltip label="Grid view">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'relative isolate size-[34px] p-1.5 [&_svg]:size-[13px]',
                    view === 'grid' &&
                      'bg-transparent text-foreground forced-colors:text-[HighlightText]',
                  )}
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                  onClick={() => onViewChange('grid')}
                >
                  {view === 'grid' && (
                    <motion.span
                      className="absolute inset-0 -z-10 rounded-[inherit] bg-surface shadow-[0_1px_3px_#00000010] forced-colors:bg-[Highlight]"
                      aria-hidden="true"
                      layoutId="display"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <Grid2X2 aria-hidden="true" />
                </Button>
              </Tooltip>
              <Tooltip label="List view">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'relative isolate size-[34px] p-1.5 [&_svg]:size-[13px]',
                    view === 'list' &&
                      'bg-transparent text-foreground forced-colors:text-[HighlightText]',
                  )}
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                  onClick={() => onViewChange('list')}
                >
                  {view === 'list' && (
                    <motion.span
                      className="absolute inset-0 -z-10 rounded-[inherit] bg-surface shadow-[0_1px_3px_#00000010] forced-colors:bg-[Highlight]"
                      aria-hidden="true"
                      layoutId="display"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                  <List aria-hidden="true" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
