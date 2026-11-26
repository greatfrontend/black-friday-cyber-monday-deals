import { useState } from 'react';
import { motion } from 'motion/react';
import type { Deal } from '../lib/types';
import { getFeaturedDeals, getOfferLabel } from '../lib/deals';
import { cn } from '../lib/utils';
import { ProductMark } from './product-mark';
import { SaleArtwork } from './sale-artwork';
import { HeroOfferPreview } from './hero-offer-preview';

interface HeroProps {
  year: number;
  checkedDate: string;
  deals: Deal[];
  featuredDealIds?: string[];
  onDetails: (deal: Deal) => void;
}

export function Hero({ year, checkedDate, deals, featuredDealIds, onDetails }: HeroProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const previews = getFeaturedDeals({ deals, featuredDealIds });
  const selected = previews[selectedIndex] ?? previews[0];

  return (
    <section
      aria-labelledby="intro-title"
      className={cn(
        'relative isolate w-full pt-8 pb-9 text-center',
        'max-[600px]:pt-5 max-[600px]:pb-6',
      )}
    >
      <SaleArtwork year={year} />
      <div
        className={cn(
          'mx-auto grid w-[min(1320px,calc(100%-80px))] items-center gap-4',
          'min-[821px]:grid-cols-[minmax(0,1fr)_minmax(300px,34%)] min-[821px]:gap-8 min-[821px]:text-left',
          'max-[850px]:w-[calc(100%-48px)] max-[600px]:w-[calc(100%-36px)]',
          'max-[340px]:w-[calc(100%-24px)]',
        )}
      >
        <div className="min-w-0">
          <h1
            id="intro-title"
            className={cn(
              'font-heading text-[clamp(2.5rem,4.8vw,4rem)] leading-[1.08] font-medium tracking-[-0.055em]',
              'max-[600px]:text-[clamp(1.875rem,8vw,3.25rem)]',
              'motion-safe:animate-[headline-fade_260ms_ease-out]',
            )}
          >
            <span className="block">
              Black Friday <span className="text-muted-foreground">&</span>
            </span>
            <span className="block">Cyber Monday deals.</span>
          </h1>
          <p
            className={cn(
              'mt-3 text-sm leading-5 text-muted-foreground',
              'motion-safe:animate-[hero-offer-reveal_400ms_300ms_ease-out_both]',
            )}
          >
            For developers and designers.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Updated {checkedDate}</p>
        </div>
        <div className="mx-auto w-full max-w-[420px] min-[821px]:mr-0">
          <div
            aria-label="Featured deals selected by the maintainers"
            className="flex flex-wrap justify-center gap-2 max-[400px]:gap-1"
            onPointerLeave={() => setActiveIndex(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null);
            }}
          >
            {previews.map((deal, index) => (
              <span
                key={deal.id}
                className="inline-flex motion-safe:animate-[hero-offer-reveal_350ms_ease-out_both]"
                style={{ animationDelay: `${360 + index * 40}ms` }}
              >
                <motion.button
                  type="button"
                  aria-label={`Preview ${deal.name}`}
                  aria-description={getOfferLabel(deal.offer)}
                  aria-haspopup="dialog"
                  onClick={() => onDetails(deal)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') {
                      setActiveIndex(index);
                      setSelectedIndex(index);
                    }
                  }}
                  onFocus={() => {
                    setActiveIndex(index);
                    setSelectedIndex(index);
                  }}
                  animate={{
                    scale:
                      activeIndex === index
                        ? 1.15
                        : activeIndex !== null && Math.abs(activeIndex - index) === 1
                          ? 1.04
                          : 1,
                    y: activeIndex === index ? -4 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={cn(
                    'relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl',
                    'border border-border/50 bg-surface/80 shadow-[0_2px_5px_-3px_#0003]',
                    'transition-colors hover:border-border-strong/50 hover:bg-muted focus-visible:bg-muted',
                    selectedIndex === index && 'border-brand/60 bg-brand/10',
                  )}
                >
                  <ProductMark websiteUrl={deal.url} />
                </motion.button>
              </span>
            ))}
          </div>
          {selected && <HeroOfferPreview deal={selected} onDetails={onDetails} />}
        </div>
      </div>
    </section>
  );
}
