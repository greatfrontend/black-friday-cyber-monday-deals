import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import type { ReactElement } from 'react';
import { cn } from '../../lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;

interface TooltipProps {
  label: string;
  children: ReactElement;
  side?: TooltipPrimitive.Positioner.Props['side'];
}

export function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={6} className="z-70">
          <TooltipPrimitive.Popup
            className={cn(
              'max-w-52 rounded-md border border-border bg-surface px-2.5 py-1.5',
              'text-xs leading-4 font-medium text-foreground shadow-md',
              'motion-safe:transition-opacity motion-safe:duration-100',
              'motion-safe:data-starting-style:opacity-0 motion-safe:data-ending-style:opacity-0',
            )}
          >
            {label}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
