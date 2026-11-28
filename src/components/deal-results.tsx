import { cn } from '../lib/utils';
import { ArrowUpRight, RotateCcw, SearchX } from 'lucide-react';
import type { Catalog, CopiedCoupon, Deal } from '../lib/types';
import { getCopiedCouponCode } from '../lib/coupon-copy';
import { getDealKey } from '../lib/deals';
import { getSponsoredDealIds } from '../lib/sponsors';
import { Button } from './ui/button';
import { DealLayout } from './deal-layout';

interface DealResultsProps {
  catalog: Catalog | null;
  deals: Deal[];
  error: string;
  view: 'grid' | 'list';
  saved: string[];
  copiedCoupon: CopiedCoupon | null;
  savedOnly: boolean;
  onRetry: () => void;
  onClear: () => void;
  onSave: (deal: Deal) => void;
  onCopy: (deal: Deal, code: string) => void;
  onDetails: (deal: Deal) => void;
}

export function DealResults({
  catalog,
  deals,
  error,
  view,
  saved,
  copiedCoupon,
  savedOnly,
  onRetry,
  onClear,
  onSave,
  onCopy,
  onDetails,
}: DealResultsProps) {
  if (error) {
    return (
      <div
        className={cn(
          'flex min-h-[340px] flex-col items-center justify-center gap-4 rounded-md border',
          'border-border p-8 text-center [&>h3]:text-[23px] [&>h3]:font-medium',
          '[&>h3]:tracking-[-0.8px] [&>p]:max-w-[340px] [&>p]:text-base [&>p]:leading-[1.65]',
          '[&>p]:text-muted-foreground',
        )}
      >
        <RotateCcw className="size-8 text-muted-foreground" aria-hidden="true" />
        <h3>Could not load deals</h3>
        <p>{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Reload collection
        </Button>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div
        className={cn(
          'grid grid-cols-3 gap-4 max-[1199px]:grid-cols-2 max-[600px]:grid-cols-1',
          'max-[600px]:gap-3.5 [&>li]:min-w-0',
        )}
        aria-busy="true"
        aria-label="Loading deals"
      >
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div
            key={key}
            className={cn(
              'min-h-[330px] rounded-md border border-border bg-surface p-5 [&>span]:mb-5 [&>span]:block',
              '[&>span]:h-3.5 [&>span]:rounded-md [&>span]:bg-muted [&>span:first-child]:size-10',
              '[&>span:last-child]:w-[70%]',
              'motion-safe:[&>span]:animate-[skeleton_1.2s_ease-in-out_infinite_alternate]',
            )}
          >
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div
        className={cn(
          'flex min-h-[340px] flex-col items-center justify-center gap-4 rounded-md border',
          'border-border p-8 text-center [&>h3]:text-[23px] [&>h3]:font-medium',
          '[&>h3]:tracking-[-0.8px] [&>p]:max-w-[340px] [&>p]:text-base [&>p]:leading-[1.65]',
          '[&>p]:text-muted-foreground',
        )}
      >
        <SearchX className="size-9 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <h3>{savedOnly ? 'No saved deals' : 'No matching deals'}</h3>
        <p>
          {savedOnly
            ? 'Bookmark a deal to keep it here. Saved deals stay in this browser.'
            : 'Try a different search or clear the filters.'}
        </p>
        <Button variant="outline" onClick={onClear}>
          View all deals
          <ArrowUpRight aria-hidden="true" />
        </Button>
      </div>
    );
  }

  const sponsoredIds = getSponsoredDealIds(catalog);
  const items = deals.map((deal) => ({
    id: getDealKey(catalog.year, deal.id),
    cardProps: {
      deal,
      year: catalog.year,
      view,
      sponsored: sponsoredIds.includes(deal.id),
      saved: saved.includes(getDealKey(catalog.year, deal.id)),
      copiedCode: getCopiedCouponCode(copiedCoupon, catalog.year, deal.id),
      onSave: () => onSave(deal),
      onCopy: (code: string) => onCopy(deal, code),
      onDetails: () => onDetails(deal),
    },
  }));

  return <DealLayout items={items} view={view} />;
}
