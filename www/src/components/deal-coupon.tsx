import { Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

interface DealCouponProps {
  code: string;
  productName: string;
  copied: boolean;
  onCopy: (code: string) => void;
}

export function DealCoupon({ code, productName, copied, onCopy }: DealCouponProps) {
  return (
    <button
      type="button"
      onClick={() => onCopy(code)}
      aria-label={`Copy coupon ${code} for ${productName}`}
      data-copied={copied || undefined}
      className={cn(
        'group/coupon relative z-3 inline-flex min-h-8 max-w-full cursor-pointer items-stretch',
        'rounded-md border border-dotted border-border-strong/50 bg-surface text-left',
        'transition-[background-color,border-color] duration-150 hover:border-ring',
        'data-copied:border-ring data-copied:bg-brand/15 pointer-coarse:min-h-11',
      )}
    >
      <span className="min-w-0 self-center px-2.5 py-1.5 font-mono text-[13px] font-medium wrap-anywhere">
        {code}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative grid w-8 shrink-0 place-items-center border-l border-dotted border-border-strong/40',
          'text-muted-foreground group-data-copied/coupon:text-foreground',
        )}
      >
        <Copy
          className={cn(
            'absolute size-3.5 group-data-copied/coupon:opacity-0',
            'motion-safe:transition-[opacity,scale] motion-safe:duration-200',
            'motion-safe:group-data-copied/coupon:scale-75',
          )}
        />
        <Check
          className={cn(
            'absolute size-3.5 opacity-0 group-data-copied/coupon:opacity-100',
            'motion-safe:scale-75 motion-safe:transition-[opacity,scale] motion-safe:duration-200',
            'motion-safe:group-data-copied/coupon:scale-100',
          )}
        />
      </span>
    </button>
  );
}
