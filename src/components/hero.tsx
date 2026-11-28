import { useEffect, useMemo, useState } from 'react';
import type { Catalog, Deal } from '../lib/types';
import { formatCheckedDate, getFeaturedDeals, getLatestDealAddedAt } from '../lib/deals';
import { getActiveSponsorship } from '../lib/sponsors';
import { cn } from '../lib/utils';
import { SaleArtwork } from './sale-artwork';
import { HeroSlots } from './hero-slots';

interface HeroProps {
  year: number;
  catalog: Catalog;
  onDetails: (deal: Deal) => void;
}

export function Hero({ year, catalog, onDetails }: HeroProps) {
  const sponsorship = getActiveSponsorship(catalog);
  const latestAddedAt = useMemo(() => getLatestDealAddedAt(catalog.deals), [catalog.deals]);
  const [timeZone, setTimeZone] = useState<string>();

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const updated = latestAddedAt ? (
    <>
      {', updated '}
      <time dateTime={latestAddedAt}>{formatCheckedDate(latestAddedAt, timeZone)}</time>
    </>
  ) : null;

  return (
    <section
      aria-labelledby="intro-title"
      className={cn(
        'relative isolate w-full pt-8 text-left max-[600px]:pt-5',
        sponsorship ? 'pb-4 max-[600px]:pb-3' : 'pb-8 max-[600px]:pb-6',
      )}
    >
      <SaleArtwork year={year} extendBehindSponsors={Boolean(sponsorship)} />
      <div
        className={cn(
          'mx-auto w-[min(1320px,calc(100%-80px))]',
          'max-[850px]:w-[calc(100%-48px)] max-[600px]:w-[calc(100%-36px)]',
          !sponsorship &&
            cn(
              'grid items-center gap-4',
              'min-[821px]:grid-cols-[minmax(0,1fr)_minmax(300px,34%)] min-[821px]:gap-8',
            ),
        )}
      >
        <div className="min-w-0">
          <h1
            id="intro-title"
            className={cn(
              'font-heading text-[clamp(2.25rem,3.5vw,3rem)] leading-[1.1] font-medium tracking-[-0.05em]',
              'max-[400px]:text-[clamp(2rem,9vw,2.25rem)]',
              'motion-safe:animate-[headline-fade_260ms_ease-out]',
            )}
          >
            <span className="inline-block">
              Black Friday <span className="text-muted-foreground">&</span>
            </span>{' '}
            <span className="inline-block">Cyber Monday deals {year}</span>
          </h1>
          <p
            className={cn(
              'mt-3 text-xs leading-5 text-muted-foreground max-[420px]:text-[11px] sm:text-sm',
              'motion-safe:animate-[hero-offer-reveal_400ms_300ms_ease-out_both]',
            )}
          >
            For developers and designers
            {updated &&
              (timeZone ? (
                <span className="motion-safe:animate-[fade-in_300ms_ease-out_both]">{updated}</span>
              ) : (
                <noscript>{updated}</noscript>
              ))}
            .
          </p>
        </div>
        {!sponsorship && (
          <HeroSlots
            tiles={getFeaturedDeals(catalog).map((deal) => ({ kind: 'deal', deal }))}
            label="Featured deals selected by the maintainers"
            onDetails={onDetails}
          />
        )}
      </div>
    </section>
  );
}
