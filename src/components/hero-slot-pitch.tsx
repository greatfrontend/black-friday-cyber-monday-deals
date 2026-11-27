import { ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { CouponFrame } from './coupon-frame';
import { heroCouponClassName } from './hero-offer-preview';

/** The coupon shown for an unsold slot: the offer on it is the slot itself. */
export function HeroSlotPitch({ href, priceUsd }: { href: string; priceUsd: number }) {
  return (
    <a
      href={href}
      aria-label={`Sponsor this slot for $${priceUsd}. See what sponsors get`}
      className={heroCouponClassName}
    >
      <CouponFrame layout="columns" />
      <span className="flex min-h-22 min-w-0 items-center px-5 py-2.5 max-[400px]:px-4 [grid-area:1/1]">
        <span className="w-full">
          <span className="block text-sm leading-[1.125rem] font-medium text-muted-foreground">
            Open sponsor slot
          </span>
          <span className="mt-0.5 block text-lg leading-5 font-semibold tracking-tight text-foreground">
            Your product here
          </span>
        </span>
      </span>
      <span className="flex min-w-0 flex-col justify-center gap-1 px-3.5 py-2.5 [grid-area:1/2]">
        <span className="grid min-h-12 items-center">
          <span>
            <span className="block font-mono text-[10px] leading-4 tracking-wider text-muted-foreground uppercase">
              One-time
            </span>
            <span className="mt-0.5 block font-mono text-xs leading-4 font-medium">
              ${priceUsd}
            </span>
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium">
          Details{' '}
          <ArrowUpRight
            aria-hidden="true"
            className={cn(
              'size-3 motion-safe:transition-transform',
              'motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5',
            )}
          />
        </span>
      </span>
    </a>
  );
}
