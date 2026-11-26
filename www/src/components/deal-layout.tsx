import { Masonry, type RenderComponentProps } from 'masonic';
import { useEffect, useState, type ComponentProps } from 'react';
import { cn } from '../lib/utils';
import { DealCard } from './deal-card';

export interface DealLayoutItem {
  id: string;
  cardProps: ComponentProps<typeof DealCard>;
}

function DealList(props: ComponentProps<'ul'>) {
  return <ul {...props} aria-label="Deals" />;
}

// Keep this component identity stable so saving or copying does not remount cards.
function MasonryDealCard({ data }: RenderComponentProps<DealLayoutItem>) {
  return <DealCard {...data.cardProps} />;
}

export function DealLayout({ items, view }: { items: DealLayoutItem[]; view: 'grid' | 'list' }) {
  const [canMeasure, setCanMeasure] = useState(false);

  useEffect(() => setCanMeasure(true), []);

  // Measured layouts need a browser. Keep complete, readable cards in static HTML.
  if (!canMeasure || view === 'list') {
    return (
      <ul
        role="list"
        aria-label="Deals"
        className={cn(
          'grid [&>li]:min-w-0',
          view === 'list'
            ? 'grid-cols-1 gap-3.5'
            : 'grid-cols-3 gap-4 max-[1199px]:grid-cols-2 max-[600px]:grid-cols-1 max-[600px]:gap-3.5',
        )}
      >
        {items.map(({ id, cardProps }) => (
          <li key={id}>
            <DealCard {...cardProps} view={view} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Masonry
      as={DealList}
      itemAs="li"
      role="list"
      tabIndex={-1}
      key={items.map((item) => item.id).join('|')}
      className="min-w-0"
      items={items}
      itemKey={(item) => item.id}
      render={MasonryDealCard}
      columnWidth={280}
      maxColumnCount={3}
      columnGutter={16}
      itemHeightEstimate={360}
      overscanBy={Infinity}
    />
  );
}
