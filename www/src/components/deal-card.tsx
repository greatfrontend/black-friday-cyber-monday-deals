import { categoryLabels } from '../lib/categories';
import { Bookmark } from 'lucide-react';
import type { Deal } from '../lib/types';
import { getOfferLabel, plainText } from '../lib/deals';
import { cn } from '../lib/utils';
import { ArrowLink } from './ui/arrow-button';
import { Button } from './ui/button';
import { ProductMark } from './product-mark';
import { DealCoupon } from './deal-coupon';
import { CouponFrame } from './coupon-frame';
import { SponsoredBadge } from './sponsored-badge';
import { Tooltip } from './ui/tooltip';

interface DealCardProps {
  deal: Deal;
  view?: 'grid' | 'list';
  sponsored?: boolean;
  saved: boolean;
  copiedCode: string;
  onSave: () => void;
  onCopy: (code: string) => void;
  onDetails: () => void;
}

export function DealCard({
  deal,
  sponsored = false,
  saved,
  copiedCode,
  onSave,
  onCopy,
  onDetails,
  view = 'grid',
}: DealCardProps) {
  const list = view === 'list';
  const offerLabel = getOfferLabel(deal.offer);
  const offerTerms = plainText(deal.offer);
  const hasAdditionalTerms = offerTerms.trim().toLowerCase() !== offerLabel.toLowerCase();

  return (
    <article
      aria-labelledby={`deal-${deal.id}`}
      className={cn(
        'group/deal relative isolate grid grid-cols-1 cursor-pointer rounded-xl',
        'transition-[filter] duration-200',
        'drop-shadow-[0_2px_3px_var(--coupon-shadow)] hover:drop-shadow-[0_4px_7px_var(--coupon-shadow)]',
        'has-[[data-card-open]:focus-visible]:outline-1',
        'has-[[data-card-open]:focus-visible]:outline-foreground',
        list && 'min-[701px]:grid min-[701px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]',
      )}
    >
      <CouponFrame layout={list ? 'responsive' : 'stacked'} lightOfferSurface="faint-gray" />
      <div className="px-5 pt-5 pb-4 [grid-area:1/1]">
        <header
          className={cn(
            'grid grid-cols-[36px_minmax(0,1fr)] items-center gap-2.5 pr-8',
            list && 'min-[701px]:pr-0',
          )}
        >
          <ProductMark websiteUrl={deal.url} faviconUrl={deal.faviconUrl} className="size-9" />
          <div className="min-w-0">
            <h3
              id={`deal-${deal.id}`}
              className="text-base leading-[1.4] font-semibold tracking-tight wrap-anywhere"
            >
              <button
                type="button"
                data-card-open
                aria-label={`View details for ${deal.name}`}
                aria-haspopup="dialog"
                onClick={onDetails}
                className={cn(
                  'static cursor-pointer text-left after:absolute after:inset-0 after:z-2',
                  "after:rounded-xl after:content-[''] focus-visible:outline-none",
                )}
              >
                {deal.name}
              </button>
            </h3>
            <p
              className={cn(
                'mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1',
                'text-[13px] leading-[1.4] text-muted-foreground',
              )}
            >
              {categoryLabels[deal.categories[0]] ?? deal.categories[0]}
              {sponsored && <SponsoredBadge />}
            </p>
          </div>
        </header>
        <p className="mt-3.5 line-clamp-2 text-sm leading-[1.6] text-pretty text-muted-foreground wrap-anywhere">
          {plainText(deal.description)}
        </p>
      </div>
      <Tooltip label={saved ? 'Unsave deal' : 'Save deal'}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${saved ? 'Unsave' : 'Save'} ${deal.name}`}
          aria-pressed={saved}
          onClick={onSave}
          className={cn(
            'absolute top-3 right-3 z-3 size-8 rounded-full [&_svg]:size-[15px]',
            'pointer-coarse:top-2 pointer-coarse:right-2 pointer-coarse:size-11',
            'focus-visible:outline-foreground',
            saved && 'bg-muted text-foreground hover:bg-muted/80',
          )}
        >
          <Bookmark
            aria-hidden="true"
            strokeWidth={1.6}
            className={cn(
              saved &&
                'fill-foreground stroke-foreground motion-safe:animate-[save-appear_180ms_ease-out]',
            )}
          />
        </Button>
      </Tooltip>
      <div
        className={cn(
          'flex flex-col px-5 pt-4 pb-4 [grid-area:2/1]',
          list && 'min-[701px]:pt-5 min-[701px]:[grid-area:1/2]',
        )}
      >
        <div
          className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', list && 'min-[701px]:pr-8')}
        >
          <p className="text-lg leading-tight font-semibold tracking-tight text-foreground">
            {offerLabel}
          </p>
          {deal.couponCodes.length > 0 && (
            <DealCoupon
              code={deal.couponCodes[0]}
              productName={deal.name}
              copied={copiedCode === deal.couponCodes[0]}
              onCopy={onCopy}
            />
          )}
        </div>
        {hasAdditionalTerms && (
          <p className="mt-2.5 text-sm leading-[1.6] text-pretty text-foreground/85 wrap-anywhere">
            {offerTerms}
          </p>
        )}
        <footer className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="min-w-0 text-[13px] leading-normal text-muted-foreground">
            {deal.validity === '-' || deal.validity === '–' ? 'End date not listed' : deal.validity}
          </span>
          <ArrowLink
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="relative z-3 focus-visible:outline-foreground"
          >
            Get deal
            <span className="sr-only"> for {deal.name} (opens in a new tab)</span>
          </ArrowLink>
        </footer>
      </div>
    </article>
  );
}
