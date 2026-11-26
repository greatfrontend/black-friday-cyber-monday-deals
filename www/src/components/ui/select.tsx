import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ScrollArea } from './scroll-area';

interface SelectProps {
  label: string;
  value: string;
  items: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  className?: string;
}

export function Select({ label, value, items, onValueChange, className }: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      items={items}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next);
      }}
    >
      <SelectPrimitive.Trigger
        aria-label={label}
        className={cn(
          'flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border',
          'border-border bg-surface px-3.5 text-sm hover:border-border-strong',
          className,
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon>
          <ChevronDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={6}
          align="end"
          className="z-60"
          alignItemWithTrigger={false}
        >
          <SelectPrimitive.Popup
            className={cn(
              'transition-[opacity,translate] duration-180 data-starting-style:opacity-0',
              'data-ending-style:opacity-0 data-starting-style:-translate-y-[3px]',
              'data-ending-style:-translate-y-[3px] motion-reduce:transition-none',
              'max-h-(--available-height) min-w-(--anchor-width) overflow-hidden rounded-xl border',
              'border-border bg-surface shadow-xl',
            )}
          >
            <ScrollArea
              className="max-h-[min(320px,var(--available-height))]"
              contentClassName="p-1.5"
              viewportProps={{ render: <SelectPrimitive.List />, tabIndex: -1 }}
            >
              {items.map((item) => (
                <SelectPrimitive.Item
                  key={item.value}
                  value={item.value}
                  className={cn(
                    'relative flex min-h-11 cursor-pointer items-center gap-4 rounded-md py-2 pr-9 pl-3',
                    'text-sm outline-none data-highlighted:bg-muted',
                  )}
                >
                  <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2.5">
                    <Check aria-hidden="true" className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </ScrollArea>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
