import { categoryLabels } from '../lib/categories';
import { Copy, Pencil, Ticket } from 'lucide-react';
import type { Deal } from '../lib/types';
import { buildDealUrl, buildSuggestionUrl, getOfferLabel, plainText } from '../lib/deals';
import { ArrowLink } from './ui/arrow-button';
import { Dialog } from './ui/dialog';
import { Button, buttonVariants } from './ui/button';
import { ProductMark } from './product-mark';
import { SponsoredBadge } from './sponsored-badge';

interface DealDetailProps {
  deal: Deal | null;
  year: number;
  status?: 'loading' | 'unavailable';
  sponsored?: boolean;
  onClose: () => void;
  onCopy: (code: string) => void;
  copiedCode: string;
}

export function DealDetail({
  deal,
  year,
  status,
  sponsored = false,
  onClose,
  onCopy,
  copiedCode,
}: DealDetailProps) {
  return (
    <Dialog
      open={deal !== null || status !== undefined}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={deal?.name ?? (status === 'loading' ? 'Loading deal…' : 'Deal details')}
      icon={
        deal && (
          <ProductMark websiteUrl={deal.url} faviconUrl={deal.faviconUrl} className="size-9" />
        )
      }
      subtitle={
        deal && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {deal.categories.map((category) => categoryLabels[category] ?? category).join(' · ')}
            {sponsored && <SponsoredBadge />}
          </span>
        )
      }
    >
      {status === 'unavailable' && (
        <p className="mt-5 text-sm text-muted-foreground">This deal could not be loaded.</p>
      )}
      {deal && (
        <div className="mt-5 space-y-5">
          <p className="text-sm leading-6 text-muted-foreground">{plainText(deal.description)}</p>
          <div className="rounded-lg bg-offer-surface p-4">
            <p className="flex items-center gap-2 text-base font-semibold">
              <Ticket className="size-[18px]" aria-hidden="true" />
              {getOfferLabel(deal.offer)}
            </p>
            <p className="mt-3 text-sm leading-6">{plainText(deal.offer)}</p>
          </div>
          {deal.couponCodes.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium">Coupon codes</h3>
              <div className="flex flex-wrap gap-2">
                {deal.couponCodes.map((code) => (
                  <Button
                    key={code}
                    variant="outline"
                    onClick={() => onCopy(code)}
                    className="focus-visible:outline-foreground"
                  >
                    <code className="text-sm">{code}</code>
                    <Copy aria-hidden="true" />
                    <span className="sr-only">Copy coupon</span>
                    {copiedCode === code && <span className="text-sm text-foreground">Copied</span>}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Validity:</span>{' '}
            {deal.validity === '-' || deal.validity === '–'
              ? 'Not stated by the source.'
              : deal.validity}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {year < 2026 ? 'This is an archived offer. ' : ''}Offers can change. Confirm pricing and
            eligibility on the seller’s website.
          </p>
          <div className="flex flex-wrap items-center gap-2 max-[359px]:gap-1">
            <a
              className={buttonVariants({
                variant: 'ghost',
                size: 'sm',
                className: 'max-[359px]:px-0',
              })}
              href={buildSuggestionUrl(deal, year)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Pencil aria-hidden="true" />
              Suggest an edit
            </a>
            <ArrowLink
              variant="primary"
              className="ml-auto min-h-9"
              href={buildDealUrl(deal.url, year)}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              Get deal
              <span className="sr-only">from {deal.name} (opens in a new tab)</span>
            </ArrowLink>
          </div>
        </div>
      )}
    </Dialog>
  );
}
