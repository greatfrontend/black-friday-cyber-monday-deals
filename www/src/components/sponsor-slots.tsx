import { useEffect, useRef, useState, type Ref } from 'react';
import { ArrowUpRight, Lock, Plus } from 'lucide-react';
import type { Catalog, Deal, Sponsorship } from '../lib/types';
import { getDiscount, getOfferLabel } from '../lib/deals';
import {
  formatSlotAvailability,
  getHeroSlots,
  getSlotAvailability,
  type HeroSlot,
} from '../lib/sponsors';
import { cn } from '../lib/utils';
import { CouponFrame } from './coupon-frame';
import { HeroSlots, type HeroTile } from './hero-slots';
import { ArrowLink } from './ui/arrow-button';

interface SponsorSlotsProps {
  catalog: Catalog;
  sponsorship: Sponsorship;
  /** Where open slots and the header link lead. */
  sponsorHref: string;
  onDetails: (deal: Deal) => void;
  layout?: 'preview' | 'grid';
  stickyRowRef?: Ref<HTMLElement>;
}

const sponsorGridWidthClassName = cn(
  'mx-auto w-[min(1320px,calc(100%-80px))] max-[850px]:w-[calc(100%-48px)]',
  'max-[600px]:w-[calc(100%-36px)]',
);

const sponsorGridLayouts = [
  {
    columns: 2,
    gridClassName: 'grid-cols-2',
    hideOverflowClassName: '@max-[394px]:hidden',
  },
  {
    columns: 3,
    gridClassName: '@min-[394px]:grid-cols-3',
    hideOverflowClassName: '@min-[394px]:@max-[528px]:hidden',
  },
  {
    columns: 4,
    gridClassName: '@min-[528px]:grid-cols-4',
    hideOverflowClassName: '@min-[528px]:@max-[662px]:hidden',
  },
  {
    columns: 5,
    gridClassName: '@min-[662px]:grid-cols-5',
    hideOverflowClassName: '@min-[662px]:@max-[1182px]:hidden',
  },
];

const sponsorGridClassName = cn(
  'grid gap-2',
  sponsorGridLayouts.map(({ gridClassName }) => gridClassName),
  '@min-[1182px]:grid-cols-9 @min-[1182px]:gap-1.5',
);

function getOpenSlotVisibilityClasses(index: number, occupiedCount: number) {
  return sponsorGridLayouts.map(({ columns, hideOverflowClassName }) => {
    // Open slots fill the last occupied row, or the first row when all slots are open.
    const visibleRows = Math.max(1, Math.ceil(occupiedCount / columns));
    return index >= visibleRows * columns && hideOverflowClassName;
  });
}

const sponsorTicketClassName = cn(
  'group/deal relative isolate grid min-h-19 min-w-0 cursor-pointer rounded-xl',
  'focus-visible:outline-2 focus-visible:outline-foreground',
);

const sponsorTicketColumnsClassName =
  'grid-cols-[clamp(38px,calc(100%_-_92px),54px)_minmax(0,1fr)]';

function SponsorSlotCard({
  slot,
  sponsorHref,
  priceUsd,
  onDetails,
}: {
  slot: HeroSlot;
  sponsorHref: string;
  priceUsd: number;
  onDetails: (deal: Deal) => void;
}) {
  if (slot.kind === 'open') {
    return (
      <a
        href={sponsorHref}
        aria-label={`Open sponsor slot. Become a sponsor for $${priceUsd}`}
        className={cn(
          sponsorTicketClassName,
          sponsorTicketColumnsClassName,
          'text-xs font-medium text-muted-foreground transition-colors hover:text-foreground',
        )}
      >
        <CouponFrame layout="columns" lightOfferSurface="white" />
        <span className="grid place-items-center [grid-area:1/1]">
          <Plus aria-hidden="true" className="size-4" />
        </span>
        <span className="grid place-items-center px-1 text-center [grid-area:1/2]">Open slot</span>
      </a>
    );
  }

  if (slot.kind === 'reserved') {
    return (
      <span
        className={cn(
          'flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border',
          'bg-background px-2 text-xs font-medium text-muted-foreground',
        )}
      >
        <Lock aria-hidden="true" className="size-3.5" />
        Reserved
      </span>
    );
  }

  const { deal, displayName, logoUrl } = slot;
  const discount = getDiscount(deal.offer);
  const offer = getOfferLabel(deal.offer);

  return (
    <button
      type="button"
      aria-label={discount === null ? displayName : `${displayName}, ${offer}`}
      aria-haspopup="dialog"
      onClick={() => onDetails(deal)}
      className={cn(
        sponsorTicketClassName,
        'text-left',
        discount === null
          ? 'grid-cols-1 border border-border bg-surface hover:border-border-strong'
          : sponsorTicketColumnsClassName,
      )}
    >
      {discount !== null && (
        <>
          <CouponFrame layout="columns" lightOfferSurface="white" />
          <span
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-0.5 py-2 [grid-area:1/1]',
              'leading-none font-semibold tabular-nums',
              'text-foreground dark:text-white forced-colors:text-foreground',
            )}
          >
            {offer.startsWith('Up to ') && <span className="text-[11px] font-medium">Up to</span>}
            <span
              className={cn(
                'tracking-tight',
                String(discount).length > 2 ? 'text-sm' : 'text-base',
              )}
            >
              {discount}%
            </span>
          </span>
        </>
      )}
      <span
        className={cn(
          'flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-center',
          discount !== null && '[grid-area:1/2]',
        )}
      >
        <img
          src={logoUrl}
          alt=""
          width={36}
          height={36}
          decoding="async"
          className="size-9 shrink-0 rounded-md object-contain"
        />
        <span
          className="min-w-0 text-xs leading-4 font-bold tracking-tight text-foreground wrap-anywhere"
          title={displayName}
        >
          {displayName}
        </span>
      </span>
    </button>
  );
}

export function SponsorSlots({
  catalog,
  sponsorship,
  sponsorHref,
  onDetails,
  layout = 'preview',
  stickyRowRef,
}: SponsorSlotsProps) {
  const headingRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    // The heading scrolls away when the row reaches its sticky position.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setIsPinned(entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0));
    });
    observer.observe(heading);
    return () => observer.disconnect();
  }, [layout]);

  const slots = getHeroSlots(catalog);
  const header = (
    <p
      className={cn(
        'flex min-h-6 items-center justify-between gap-3 text-xs leading-4 text-muted-foreground',
        layout === 'preview' && 'mb-2.5',
      )}
    >
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-sm font-semibold text-foreground">Sponsored deals</span>
        <span>{formatSlotAvailability(sponsorship)}</span>
      </span>
      {getSlotAvailability(sponsorship).open > 0 &&
        (layout === 'grid' ? (
          <ArrowLink
            href={sponsorHref}
            direction="right"
            className="min-h-7 gap-1.5 py-0.5 pl-2.5 text-xs whitespace-nowrap"
          >
            Become a sponsor
          </ArrowLink>
        ) : (
          <a
            href={sponsorHref}
            className={cn(
              'group inline-flex min-h-6 shrink-0 items-center gap-1 font-medium text-foreground',
              'hover:underline hover:underline-offset-4',
            )}
          >
            Become a sponsor
            <ArrowUpRight
              aria-hidden="true"
              className={cn(
                'size-3 motion-safe:transition-transform',
                'motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5',
              )}
            />
          </a>
        ))}
    </p>
  );

  if (layout === 'grid') {
    return (
      <>
        <div
          ref={headingRef}
          className={cn(sponsorGridWidthClassName, 'relative pt-3 pb-0.5 max-[600px]:pt-2')}
        >
          {header}
        </div>
        <section
          ref={stickyRowRef}
          aria-label="Sponsors"
          className={cn(
            'relative mb-14 max-[600px]:mb-9',
            'min-[851px]:sticky min-[851px]:top-0 min-[851px]:z-20',
            isPinned && 'min-[851px]:bg-background',
          )}
        >
          <div className={cn(sponsorGridWidthClassName, '@container pt-2 pb-2 max-[600px]:pb-3')}>
            <ul role="list" aria-label="Sponsor slots" className={sponsorGridClassName}>
              {slots.map((slot, index) => (
                <li
                  key={slot.kind === 'sponsor' ? slot.deal.id : `${slot.kind}-${index}`}
                  className={cn(
                    'grid min-w-0',
                    slot.kind === 'open' &&
                      getOpenSlotVisibilityClasses(index, sponsorship.slots.length),
                  )}
                >
                  <SponsorSlotCard
                    slot={slot}
                    sponsorHref={sponsorHref}
                    priceUsd={sponsorship.priceUsd}
                    onDetails={onDetails}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </>
    );
  }

  const tiles = slots.map((slot): HeroTile =>
    slot.kind === 'sponsor' ? { kind: 'deal', deal: slot.deal, logoUrl: slot.logoUrl } : slot,
  );

  return (
    <HeroSlots
      tiles={tiles}
      label="Sponsors"
      pitch={{ href: sponsorHref, priceUsd: sponsorship.priceUsd }}
      onDetails={onDetails}
      header={header}
    />
  );
}
