import { categoryLabels } from '../lib/categories';
import { useEffect, useRef, useState } from 'react';
import { Check, Clock3, X } from 'lucide-react';
import type { Catalog, CatalogIndex, CopiedCoupon, Deal, Filters } from '../lib/types';
import { getCopiedCouponCode } from '../lib/coupon-copy';
import { filterDeals, getDealKey } from '../lib/deals';
import {
  getActiveSponsorship,
  getSlotAvailability,
  getSponsoredDealIds,
  sponsorPagePath,
} from '../lib/sponsors';
import { useCatalog, useDirectoryFilters, useSavedDeals } from '../hooks/use-directory';
import { cn } from '../lib/utils';
import { ArrowButton, ArrowLink } from './ui/arrow-button';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { CategoryFilters } from './category-filters';
import { ContributeDialog } from './contribute-dialog';
import { DealDetail } from './deal-detail';
import { Hero } from './hero';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { DirectoryControls } from './directory-controls';
import { DealResults } from './deal-results';
import { SponsorSlots } from './sponsor-slots';

interface DirectoryProps {
  initialCatalog: Catalog;
  index: CatalogIndex;
  builtAt: string;
}

function revealDealsHeading() {
  requestAnimationFrame(() => {
    const heading = document.getElementById('deals-heading');
    const scrollPadding = Number.parseFloat(
      getComputedStyle(document.documentElement).scrollPaddingTop,
    );
    if (heading && heading.getBoundingClientRect().top < scrollPadding) {
      heading.scrollIntoView({ block: 'start' });
    }
  });
}

export function Directory({ initialCatalog, index, builtAt }: DirectoryProps) {
  const { filters, updateFilters, clearFilters } = useDirectoryFilters(index);
  const { catalog, error, retry } = useCatalog(initialCatalog, filters.year);
  const { saved, toggleSaved } = useSavedDeals();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selected, setSelected] = useState<{ deal: Deal; year: number } | null>(null);
  const [contributing, setContributing] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<CopiedCoupon | null>(null);
  const [notice, setNotice] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const sponsorStripRef = useRef<HTMLElement>(null);
  const revealDealsAfterDrawer = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sponsorship = getActiveSponsorship(initialCatalog);
  const displayedCatalog = catalog ?? initialCatalog;
  const deals = catalog ? filterDeals(catalog, filters, saved) : [];
  const savedCount = saved.filter((key) => key.startsWith(`${filters.year}/`)).length;
  const hasActiveFilters =
    filters.category !== 'all' || Boolean(filters.query) || filters.savedOnly;
  // A deal opens from the hero (current year) or from the results (the browsed year).
  const selectedCatalog = selected?.year === initialCatalog.year ? initialCatalog : catalog;
  const selectedIsSponsored = Boolean(
    selected && selectedCatalog && getSponsoredDealIds(selectedCatalog).includes(selected.deal.id),
  );

  useEffect(() => {
    const strip = sponsorStripRef.current;
    if (!strip) return;

    // Keep the desktop filters and scroll targets below the pinned sponsor strip.
    const documentStyle = document.documentElement.style;
    const updateHeight = () => {
      documentStyle.setProperty(
        '--sponsor-strip-height',
        `${strip.getBoundingClientRect().height}px`,
      );
    };
    const observer = new ResizeObserver(updateHeight);
    updateHeight();
    observer.observe(strip);

    return () => {
      observer.disconnect();
      documentStyle.removeProperty('--sponsor-strip-height');
    };
  }, [sponsorship]);

  useEffect(() => {
    const timer = setTimeout(
      () => setAnnouncement(`${deals.length} ${deals.length === 1 ? 'deal' : 'deals'} found.`),
      400,
    );
    return () => clearTimeout(timer);
  }, [deals.length]);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !target?.closest('input, textarea, [contenteditable="true"], [role="dialog"]')
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', focusSearch);
    return () => {
      window.removeEventListener('keydown', focusSearch);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setNotice('');
      setCopiedCoupon(null);
    }, 2600);
  }

  async function copyText(value: string, coupon?: Omit<CopiedCoupon, 'code'>) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCoupon(coupon ? { ...coupon, code: value } : null);
      showNotice(coupon ? `Coupon ${value} copied.` : 'Link copied.');
    } catch {
      setCopiedCoupon(null);
      showNotice(
        coupon ? `Copy manually: ${value}` : 'Copy the link from your browser’s address bar.',
      );
    }
  }

  function saveDeal(deal: Deal) {
    const key = getDealKey(filters.year, deal.id);
    const wasSaved = saved.includes(key);
    toggleSaved(key);
    showNotice(`${deal.name} ${wasSaved ? 'removed from' : 'added to'} saved deals.`);
  }

  function openCurrentDeal(deal: Deal) {
    setSelected({ deal, year: initialCatalog.year });
  }

  function changeFilters(changes: Partial<Filters>) {
    updateFilters(changes);
    if (mobileFilters) {
      revealDealsAfterDrawer.current = true;
    } else {
      revealDealsHeading();
    }
  }

  function resetFilters() {
    clearFilters();
    revealDealsHeading();
  }

  const filterProps = {
    catalog: displayedCatalog,
    index,
    filters,
    onChange: changeFilters,
  };

  return (
    <>
      <a
        className="fixed -top-20 left-5 z-100 rounded-full bg-brand px-[18px] py-3 text-brand-foreground focus:top-3"
        href="#deals-heading"
      >
        Skip to deals
      </a>
      <SiteHeader onContribute={() => setContributing(true)} />
      <main>
        <Hero
          year={index.currentYear}
          catalog={initialCatalog}
          builtAt={builtAt}
          onDetails={openCurrentDeal}
        />
        {sponsorship && (
          <SponsorSlots
            catalog={initialCatalog}
            sponsorship={sponsorship}
            sponsorHref={sponsorPagePath}
            onDetails={openCurrentDeal}
            layout="grid"
            stickyRowRef={sponsorStripRef}
          />
        )}
        <section
          id="deals"
          className={cn(
            'mx-auto w-[min(1320px,calc(100%-80px))] max-[850px]:w-[calc(100%-48px)]',
            'max-[600px]:w-[calc(100%-36px)] grid grid-cols-[220px_minmax(0,1fr)] gap-10 pt-1 pb-16',
            'max-[1199px]:grid-cols-[210px_minmax(0,1fr)] max-[1199px]:gap-7 max-[850px]:grid-cols-1',
            'max-[600px]:pt-0 max-[600px]:pb-[38px]',
          )}
        >
          <aside
            aria-label="Filter deals"
            className={cn(
              'sticky self-start max-[850px]:hidden',
              'top-[calc(var(--sponsor-strip-height,0px)+1.5rem)]',
            )}
          >
            <ScrollArea
              className="-m-1.5 max-h-[calc(100dvh-var(--sponsor-strip-height,0px)-3rem)]"
              contentClassName="p-1.5 pr-4"
              viewportProps={{ role: 'region', 'aria-label': 'Deal filters' }}
            >
              <CategoryFilters {...filterProps}>
                <hr className="my-5 border-border" />
                <ArrowButton
                  variant="primary"
                  className="w-full justify-between"
                  aria-haspopup="dialog"
                  onClick={() => setContributing(true)}
                >
                  Submit a deal
                </ArrowButton>
                {sponsorship && getSlotAvailability(sponsorship).open > 0 && (
                  <ArrowLink
                    href={sponsorPagePath}
                    direction="right"
                    className="mt-2 w-full justify-between"
                  >
                    Become a sponsor
                  </ArrowLink>
                )}
              </CategoryFilters>
            </ScrollArea>
          </aside>
          <div className="flex min-w-0 flex-col gap-3">
            <DirectoryControls
              filters={filters}
              onChange={changeFilters}
              searchRef={searchRef}
              dealCount={catalog?.deals.length}
              savedCount={savedCount}
              view={view}
              onViewChange={setView}
              onOpenFilters={() => setMobileFilters(true)}
              filtersOpen={mobileFilters}
              onCopyLink={() => void copyText(window.location.href)}
            />
            <div className="flex items-center justify-between gap-2.5">
              <p className="text-sm text-muted-foreground">
                {catalog ? (
                  <>
                    <span
                      key={deals.length}
                      className="inline-block font-medium text-foreground tabular-nums motion-safe:animate-[count-reveal_180ms_ease-out]"
                    >
                      {deals.length}
                    </span>{' '}
                    {deals.length === 1 ? 'deal' : 'deals'}
                    {filters.category === 'all' ? (
                      <span className="max-[600px]:sr-only"> available</span>
                    ) : (
                      <>
                        {' in '}
                        <span className="font-medium text-foreground">
                          {categoryLabels[filters.category] ?? filters.category}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  'Loading collection…'
                )}
              </p>
              <button
                type="button"
                className={cn(
                  'flex min-h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 whitespace-nowrap',
                  'text-sm text-muted-foreground hover:bg-muted hover:text-foreground',
                  !hasActiveFilters && 'invisible',
                )}
                disabled={!hasActiveFilters}
                onClick={resetFilters}
              >
                <X className="size-3" aria-hidden="true" />
                Clear filters
              </button>
            </div>
            {filters.year !== index.currentYear && (
              <div
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border border-border bg-muted px-3.5 py-3 text-sm',
                  'leading-[1.7] text-muted-foreground',
                )}
              >
                <Clock3 className="size-4 shrink-0" aria-hidden="true" />
                <p>
                  You’re browsing the <strong>{filters.year} archive</strong>. These offers are
                  historical and may no longer be available.
                </p>
              </div>
            )}
            <DealResults
              catalog={catalog}
              deals={deals}
              error={error}
              view={view}
              saved={saved}
              copiedCoupon={copiedCoupon}
              savedOnly={filters.savedOnly}
              onRetry={retry}
              onClear={resetFilters}
              onSave={saveDeal}
              onCopy={(deal, code) => void copyText(code, { year: filters.year, dealId: deal.id })}
              onDetails={(deal) => setSelected({ deal, year: filters.year })}
            />
          </div>
        </section>
      </main>
      <SiteFooter year={index.currentYear} onContribute={() => setContributing(true)} />
      <DealDetail
        deal={selected?.deal ?? null}
        year={selected?.year ?? filters.year}
        sponsored={selectedIsSponsored}
        onClose={() => setSelected(null)}
        onCopy={(code) => {
          if (selected) void copyText(code, { year: selected.year, dealId: selected.deal.id });
        }}
        copiedCode={getCopiedCouponCode(
          copiedCoupon,
          selected?.year ?? filters.year,
          selected?.deal.id ?? '',
        )}
      />
      <ContributeDialog open={contributing} onOpenChange={setContributing} year={filters.year} />
      <Dialog
        open={mobileFilters}
        onOpenChange={setMobileFilters}
        onOpenChangeComplete={(open) => {
          if (!open && revealDealsAfterDrawer.current) {
            revealDealsAfterDrawer.current = false;
            revealDealsHeading();
          }
        }}
        variant="drawer"
        title="Filter deals"
        description="Choose a category and collection year."
        footer={
          <Button className="min-h-11 w-full" onClick={() => setMobileFilters(false)}>
            Show {deals.length} deals
            <Check aria-hidden="true" />
          </Button>
        }
      >
        <CategoryFilters {...filterProps} />
      </Dialog>
      <div
        className={cn(
          'pointer-events-none fixed bottom-6 left-1/2 z-80 flex max-w-[calc(100%-32px)]',
          '-translate-x-1/2 items-center gap-[9px] rounded-[10px] border border-border-strong',
          'bg-primary px-[18px] py-[13px] text-sm leading-normal text-primary-foreground',
          'shadow-[0_8px_25px_#0002] transition-[opacity,translate] duration-150',
          'motion-reduce:transition-none',
          notice ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
        role="status"
      >
        <Check aria-hidden="true" className="size-4 shrink-0" />
        {notice}
      </div>
      <div className="sr-only" role="status" aria-atomic="true">
        {announcement}
      </div>
    </>
  );
}
