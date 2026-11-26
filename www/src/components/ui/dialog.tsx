import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { ScrollArea } from './scroll-area';
import { Tooltip } from './tooltip';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: 'dialog' | 'drawer';
}

export function Dialog({
  open,
  onOpenChange,
  onOpenChangeComplete,
  title,
  description,
  icon,
  subtitle,
  children,
  footer,
  className,
  variant = 'dialog',
}: DialogProps) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/40 transition-opacity duration-180',
            'data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none',
          )}
        />
        <DialogPrimitive.Popup
          id={variant === 'drawer' ? 'deal-filters' : undefined}
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden bg-surface shadow-2xl motion-reduce:transition-none',
            variant === 'drawer'
              ? cn(
                  'inset-y-0 right-0 h-svh max-h-none w-[min(390px,calc(100%-32px))] max-w-none',
                  'flex flex-col overflow-hidden rounded-none border-0 border-l border-border',
                  'transition-transform duration-240 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  'data-starting-style:translate-x-full data-ending-style:translate-x-full',
                )
              : cn(
                  'top-1/2 left-1/2 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2',
                  '-translate-y-1/2 rounded-xl border border-border',
                  'transition-[opacity,scale,translate] duration-280 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  'data-starting-style:opacity-0 data-starting-style:scale-96',
                  'data-starting-style:translate-y-[calc(-50%+14px)] data-ending-style:opacity-0',
                  'data-ending-style:scale-98',
                ),
            className,
          )}
        >
          <Tooltip label="Close dialog" side="bottom">
            <DialogPrimitive.Close
              aria-label="Close dialog"
              className={cn(
                'absolute top-4 right-4 z-10 grid size-9 cursor-pointer pointer-coarse:size-11 place-items-center rounded-full',
                'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </Tooltip>
          <div
            className={cn('shrink-0 px-6 pt-6', variant === 'drawer' ? 'pb-5' : 'sm:px-7 sm:pt-7')}
          >
            <div className={cn('pr-10', icon && 'flex items-center gap-3')}>
              {icon}
              <div className="min-w-0">
                <DialogPrimitive.Title
                  className={cn(
                    'leading-snug font-semibold tracking-tight wrap-break-word',
                    icon ? 'text-lg' : 'text-xl',
                  )}
                >
                  {title}
                </DialogPrimitive.Title>
                {subtitle && (
                  <div className="mt-1 text-[13px] leading-5 text-muted-foreground">{subtitle}</div>
                )}
              </div>
            </div>
            {description && (
              <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <ScrollArea
            className="min-h-0 flex-1"
            contentClassName={variant === 'drawer' ? 'px-6 pb-6' : 'px-6 pb-6 sm:px-7 sm:pb-7'}
            viewportProps={{ role: 'region', 'aria-label': `${title} content` }}
          >
            {children}
          </ScrollArea>
          {footer && (
            <div
              className={cn(
                'shrink-0 border-t border-border bg-surface px-6 pt-4',
                'pb-[max(16px,env(safe-area-inset-bottom))]',
              )}
            >
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
