import type { ReactNode } from 'react';
import type { Sponsorship } from '../lib/types';
import { getSlotAvailability } from '../lib/sponsors';
import { ArrowLink } from './ui/arrow-button';
import { Button } from './ui/button';

interface SponsorCheckoutProps {
  year: number;
  sponsorship: Sponsorship;
  contact: ReactNode;
}

/** The pay button, which follows the sponsorship data: sold out, not yet open, or open. */
export function SponsorCheckout({ year, sponsorship, contact }: SponsorCheckoutProps) {
  const { open } = getSlotAvailability(sponsorship);
  const noteClassName = 'mt-3 max-w-[52ch] text-sm leading-6 text-muted-foreground';

  if (open === 0) {
    return (
      <div id="become-a-sponsor" className="mt-8">
        <Button disabled>Sold out for {year}</Button>
      </div>
    );
  }

  if (!sponsorship.checkoutUrl) {
    return (
      <div id="become-a-sponsor" className="mt-8">
        <Button disabled>Checkout opens soon</Button>
        <p className={noteClassName}>
          Payments aren’t open yet. To ask about a slot in the meantime, {contact}.
        </p>
      </div>
    );
  }

  return (
    <div id="become-a-sponsor" className="mt-8">
      <ArrowLink
        variant="accent"
        className="min-h-10 py-1.5 pr-1.5 pl-3.5 text-sm"
        href={sponsorship.checkoutUrl}
      >
        Become a sponsor · ${sponsorship.priceUsd}
      </ArrowLink>
      <p className={noteClassName}>
        Checkout is handled by Stripe. After paying, you open a pull request with your receipt
        number.
      </p>
    </div>
  );
}
