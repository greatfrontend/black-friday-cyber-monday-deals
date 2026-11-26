import { useId } from 'react';
import { cn } from '../lib/utils';

type CouponLayout = 'stacked' | 'columns' | 'responsive';

const maskedSurface = cn(
  'absolute inset-0 overflow-hidden border border-current bg-surface',
  'shadow-[inset_0_0_0_1px_var(--surface-highlight)]',
  '[mask-image:radial-gradient(circle_at_var(--notch-a),transparent_7px,#000_7.5px),radial-gradient(circle_at_var(--notch-b),transparent_7px,#000_7.5px)]',
  '[mask-composite:intersect]',
);

function surfaceShape(part: 'product' | 'offer', layout: CouponLayout) {
  if (part === 'product') {
    return cn(
      layout === 'columns'
        ? 'rounded-l-xl border-r-0 [--notch-a:100%_0.5px] [--notch-b:100%_calc(100%_-_0.5px)]'
        : 'rounded-t-xl border-b-0 [--notch-a:0.5px_100%] [--notch-b:calc(100%_-_0.5px)_100%]',
      layout === 'responsive' &&
        cn(
          'min-[701px]:rounded-none min-[701px]:rounded-l-xl min-[701px]:border-b min-[701px]:border-r-0',
          'min-[701px]:[--notch-a:100%_0.5px] min-[701px]:[--notch-b:100%_calc(100%_-_0.5px)]',
        ),
    );
  }

  return cn(
    layout === 'columns'
      ? 'rounded-r-xl border-l-0 [--notch-a:0%_0.5px] [--notch-b:0%_calc(100%_-_0.5px)]'
      : 'rounded-b-xl border-t-0 [--notch-a:0.5px_0%] [--notch-b:calc(100%_-_0.5px)_0%]',
    layout === 'responsive' &&
      cn(
        'min-[701px]:rounded-none min-[701px]:rounded-r-xl min-[701px]:border-t min-[701px]:border-l-0',
        'min-[701px]:[--notch-a:0%_0.5px] min-[701px]:[--notch-b:0%_calc(100%_-_0.5px)]',
      ),
  );
}

function CouponPaper() {
  const paperId = useId();
  const grainId = useId();
  return (
    <svg width="100%" height="100%" className="absolute inset-0 rounded-[inherit]">
      <defs>
        <linearGradient id={paperId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="var(--paper-highlight-opacity)" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="var(--paper-ink)" stopOpacity="var(--paper-shadow-opacity)" />
        </linearGradient>
        <pattern id={grainId} width="19" height="23" patternUnits="userSpaceOnUse">
          <g fill="var(--paper-ink)" stroke="var(--paper-ink)" opacity="var(--paper-grain-opacity)">
            <circle cx="2" cy="5" r="0.4" stroke="none" />
            <circle cx="13" cy="17" r="0.3" stroke="none" />
            <path d="m8 11 1.2-.4m6-8 .7.3" strokeWidth="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${paperId})`} />
      <rect width="100%" height="100%" fill={`url(#${grainId})`} />
    </svg>
  );
}

function CouponSeam({ columns = false, className }: { columns?: boolean; className?: string }) {
  const line = {
    x1: columns ? 0.5 : 0,
    y1: columns ? 0 : 0.5,
    x2: columns ? 0.5 : '100%',
    y2: columns ? '100%' : 0.5,
  };
  return (
    <svg
      className={cn(
        'absolute overflow-visible',
        columns
          ? 'top-2.5 bottom-2.5 left-0 h-[calc(100%-20px)] w-px'
          : 'top-0 right-2.5 left-2.5 h-px w-[calc(100%-20px)]',
        className,
      )}
    >
      <line
        {...line}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="1 4"
      />
      <line
        {...line}
        stroke="var(--brand)"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="12 200"
        strokeDashoffset="12"
        className={cn(
          'opacity-0',
          'motion-safe:group-hover/deal:opacity-75 motion-safe:group-hover/deal:animate-[coupon-glint_700ms_ease-out_both]',
          'motion-safe:group-focus-within/deal:opacity-75 motion-safe:group-focus-within/deal:animate-[coupon-glint_700ms_ease-out_both]',
        )}
      />
    </svg>
  );
}

function CouponNotches({ layout }: { layout: CouponLayout }) {
  const stacked = layout === 'responsive' ? 'min-[701px]:hidden' : undefined;
  const columns = layout === 'responsive' ? 'hidden min-[701px]:block' : undefined;
  return (
    <span className="hidden supports-[mask-composite:intersect]:contents">
      {layout !== 'columns' && (
        <>
          <svg
            viewBox="0 0 8 16"
            className={cn(
              'absolute top-0 left-0 h-4 w-2 -translate-y-1/2 fill-none stroke-current',
              stacked,
            )}
          >
            <path d="M.5 1a7 7 0 0 1 0 14" />
          </svg>
          <svg
            viewBox="0 0 8 16"
            className={cn(
              'absolute top-0 right-0 h-4 w-2 -translate-y-1/2 fill-none stroke-current',
              stacked,
            )}
          >
            <path d="M7.5 1a7 7 0 0 0 0 14" />
          </svg>
        </>
      )}
      {layout !== 'stacked' && (
        <>
          <svg
            viewBox="0 0 16 8"
            className={cn(
              'absolute top-0 left-0 h-2 w-4 -translate-x-1/2 fill-none stroke-current',
              columns,
            )}
          >
            <path d="M1 .5a7 7 0 0 0 14 0" />
          </svg>
          <svg
            viewBox="0 0 16 8"
            className={cn(
              'absolute bottom-0 left-0 h-2 w-4 -translate-x-1/2 fill-none stroke-current',
              columns,
            )}
          >
            <path d="M1 7.5a7 7 0 0 1 14 0" />
          </svg>
        </>
      )}
    </span>
  );
}

// These decorative grid cells share tracks with the content, including in static HTML.
export function CouponFrame({ layout = 'stacked' }: { layout?: CouponLayout }) {
  const part = cn(
    'pointer-events-none relative -z-10 min-h-0 min-w-0 text-border transition-colors duration-200',
    'group-hover/deal:text-border-strong/75',
  );
  return (
    <>
      <span aria-hidden="true" data-coupon-part="product" className={cn(part, '[grid-area:1/1]')}>
        <span className={cn(maskedSurface, surfaceShape('product', layout))} />
      </span>
      <span
        aria-hidden="true"
        data-coupon-part="offer"
        className={cn(
          part,
          layout === 'columns' ? '[grid-area:1/2]' : '[grid-area:2/1]',
          layout === 'responsive' && 'min-[701px]:[grid-area:1/2]',
        )}
      >
        <span className={cn(maskedSurface, 'bg-offer-surface', surfaceShape('offer', layout))}>
          <CouponPaper />
        </span>
        {layout !== 'columns' && (
          <CouponSeam className={layout === 'responsive' ? 'min-[701px]:hidden' : undefined} />
        )}
        {layout !== 'stacked' && (
          <CouponSeam
            columns
            className={layout === 'responsive' ? 'hidden min-[701px]:block' : undefined}
          />
        )}
        <CouponNotches layout={layout} />
      </span>
    </>
  );
}
