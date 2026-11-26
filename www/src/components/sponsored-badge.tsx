import { cn } from '../lib/utils';

/** Marks a sponsored placement in the directory and detail view. */
export function SponsoredBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded bg-muted px-1.5 py-px font-mono text-[10px] leading-4',
        'tracking-wider text-foreground uppercase',
        className,
      )}
    >
      Sponsored
    </span>
  );
}
