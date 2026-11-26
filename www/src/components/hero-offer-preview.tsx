import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { Deal } from '../lib/types';
import { getOfferLabel } from '../lib/deals';
import { cn } from '../lib/utils';
import { CouponFrame } from './coupon-frame';

function OfferTransition({ dealId, children }: { dealId: string; children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <span className="grid min-w-0" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.span
          key={dealId}
          className="min-w-0 [grid-area:1/1]"
          initial={reducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
          transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Shared by every coupon shown under the hero tiles so they swap without a layout shift. */
export const heroCouponClassName = cn(
  'group group/deal relative isolate mx-auto mt-2 grid w-full cursor-pointer',
  'grid-cols-[minmax(0,1fr)_150px] rounded-xl text-left',
  'drop-shadow-[0_2px_3px_var(--coupon-shadow)] transition-[filter]',
  'hover:drop-shadow-[0_4px_7px_var(--coupon-shadow)]',
  'focus-visible:outline-foreground max-[400px]:grid-cols-[minmax(0,1fr)_100px]',
);

export function HeroOfferPreview({
  deal,
  onDetails,
}: {
  deal: Deal;
  onDetails: (deal: Deal) => void;
}) {
  const code = deal.couponCodes[0];

  return (
    <button
      type="button"
      aria-label={`View featured offer for ${deal.name}: ${getOfferLabel(deal.offer)}${code ? `, coupon ${code}` : ''}`}
      aria-haspopup="dialog"
      onClick={() => onDetails(deal)}
      className={heroCouponClassName}
    >
      <CouponFrame layout="columns" />
      <span className="flex min-h-22 min-w-0 items-center px-5 py-2.5 max-[400px]:px-4 [grid-area:1/1]">
        <span className="w-full">
          <OfferTransition dealId={deal.id}>
            <span className="text-sm leading-[1.125rem] font-medium text-muted-foreground wrap-anywhere">
              {deal.name}
            </span>
            <span className="mt-0.5 block text-lg leading-5 font-semibold tracking-tight text-foreground">
              {getOfferLabel(deal.offer)}
            </span>
          </OfferTransition>
        </span>
      </span>
      <span className="flex min-w-0 flex-col justify-center gap-1 px-3.5 py-2.5 [grid-area:1/2]">
        <span className="grid min-h-12 items-center">
          <OfferTransition dealId={deal.id}>
            {code ? (
              <>
                <span className="block font-mono text-[10px] leading-4 tracking-wider text-muted-foreground">
                  COUPON
                </span>
                <span className="mt-0.5 block font-mono text-xs leading-4 font-medium wrap-anywhere">
                  {code}
                </span>
              </>
            ) : (
              <span className="block text-xs leading-4 text-muted-foreground">No code listed</span>
            )}
          </OfferTransition>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium">
          Details{' '}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          />
        </span>
      </span>
    </button>
  );
}
