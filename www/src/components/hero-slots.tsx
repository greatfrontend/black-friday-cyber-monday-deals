import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Lock, Plus } from 'lucide-react';
import type { Deal } from '../lib/types';
import { getOfferLabel } from '../lib/deals';
import { cn } from '../lib/utils';
import { ProductMark } from './product-mark';
import { HeroOfferPreview } from './hero-offer-preview';
import { HeroSlotPitch } from './hero-slot-pitch';

export type HeroTile =
  | { kind: 'deal'; deal: Deal; logoUrl?: string }
  | { kind: 'reserved' }
  | { kind: 'open' };

interface HeroSlotsProps {
  tiles: HeroTile[];
  label: string;
  header?: ReactNode;
  pitch?: { href: string; priceUsd: number };
  onDetails: (deal: Deal) => void;
}

const tileClassName = cn(
  'relative grid size-11 shrink-0 place-items-center rounded-full border',
  'shadow-[0_2px_5px_-3px_#0003] transition-colors',
);

const interactiveTileClassName = cn(
  tileClassName,
  'cursor-pointer border-border/50 bg-surface/80',
  'hover:border-brand focus-visible:bg-muted focus-visible:outline-foreground',
);

function getTileKey(tile: HeroTile, index: number) {
  return tile.kind === 'deal' ? tile.deal.id : `${tile.kind}-${index}`;
}

export function HeroSlots({ tiles, label, header, pitch, onDetails }: HeroSlotsProps) {
  const firstPreviewable = tiles.findIndex((tile) => tile.kind !== 'reserved');
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, firstPreviewable));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const selected = tiles[selectedIndex];

  function preview(index: number) {
    setActiveIndex(index);
    setSelectedIndex(index);
  }

  function getTileProps(index: number) {
    return {
      onPointerEnter: (event: React.PointerEvent) => {
        if (event.pointerType === 'mouse') preview(index);
      },
      onFocus: () => preview(index),
      animate: {
        scale:
          activeIndex === index
            ? 1.15
            : activeIndex !== null && Math.abs(activeIndex - index) === 1
              ? 1.04
              : 1,
        y: activeIndex === index ? -4 : 0,
      },
      transition: { type: 'spring', stiffness: 400, damping: 28 } as const,
    };
  }

  return (
    <div
      className={cn(
        '@container mx-auto w-full min-[821px]:mr-0',
        tiles.length > 8 ? 'max-w-[444px]' : 'max-w-[420px]',
      )}
    >
      {header}
      <div
        aria-label={label}
        className={cn(
          'mx-auto flex flex-wrap justify-center gap-2',
          tiles.length > 8
            ? 'max-w-[252px] @min-[444px]:max-w-none @min-[444px]:gap-1.5'
            : tiles.length > 6
              ? 'max-w-[200px] @min-[394px]:max-w-none @min-[394px]:gap-1.5'
              : 'max-[400px]:gap-1',
        )}
        onPointerLeave={() => setActiveIndex(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null);
        }}
      >
        {tiles.map((tile, index) => (
          <span
            key={getTileKey(tile, index)}
            className="inline-flex motion-safe:animate-[hero-offer-reveal_350ms_ease-out_both]"
            style={{ animationDelay: `${360 + index * 40}ms` }}
          >
            {tile.kind === 'deal' && (
              <motion.button
                type="button"
                aria-label={`Preview ${tile.deal.name}`}
                aria-description={getOfferLabel(tile.deal.offer)}
                aria-haspopup="dialog"
                onClick={() => onDetails(tile.deal)}
                {...getTileProps(index)}
                className={cn(
                  interactiveTileClassName,
                  selectedIndex === index && 'border-border-strong bg-muted',
                )}
              >
                {tile.logoUrl ? (
                  <img
                    src={tile.logoUrl}
                    alt=""
                    width={42}
                    height={42}
                    decoding="async"
                    draggable={false}
                    className={cn(
                      'size-full rounded-full object-cover',
                      tile.deal.id === 'design-gurus' && 'bg-white p-1',
                    )}
                  />
                ) : (
                  <ProductMark websiteUrl={tile.deal.url} faviconUrl={tile.deal.faviconUrl} />
                )}
              </motion.button>
            )}
            {tile.kind === 'open' && pitch && (
              <motion.a
                href={pitch.href}
                aria-label={`Open sponsor slot. Become a sponsor for $${pitch.priceUsd}`}
                {...getTileProps(index)}
                className={cn(
                  interactiveTileClassName,
                  'border-dashed border-border-strong/60 bg-transparent text-muted-foreground',
                  'hover:text-foreground focus-visible:text-foreground',
                  selectedIndex === index && 'border-border-strong bg-muted text-foreground',
                )}
              >
                <Plus aria-hidden="true" className="size-4" />
              </motion.a>
            )}
            {tile.kind === 'reserved' && (
              <span
                role="img"
                aria-label="Reserved sponsor slot"
                title="Reserved"
                className={cn(tileClassName, 'border-border/50 bg-muted/50 text-muted-foreground')}
              >
                <Lock aria-hidden="true" className="size-3.5" />
              </span>
            )}
          </span>
        ))}
      </div>
      {selected?.kind === 'deal' && <HeroOfferPreview deal={selected.deal} onDetails={onDetails} />}
      {selected?.kind === 'open' && pitch && <HeroSlotPitch {...pitch} />}
    </div>
  );
}
