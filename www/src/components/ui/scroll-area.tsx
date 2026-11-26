import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { cn } from '../../lib/utils';

interface ScrollAreaProps extends Omit<ScrollAreaPrimitive.Root.Props, 'className'> {
  className?: string;
  viewportClassName?: string;
  contentClassName?: string;
  viewportProps?: Omit<ScrollAreaPrimitive.Viewport.Props, 'className' | 'children'>;
}

export function ScrollArea({
  children,
  className,
  viewportClassName,
  contentClassName,
  viewportProps,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative flex min-h-0 min-w-0 flex-col overflow-hidden', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className={cn(
          'min-h-0 w-full max-h-[inherit] flex-1 overscroll-contain rounded-[inherit]',
          'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
          viewportClassName,
        )}
        {...viewportProps}
      >
        <ScrollAreaPrimitive.Content className={cn('min-w-0!', contentClassName)}>
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        data-slot="scroll-area-scrollbar"
        className="m-0.5 flex w-3 touch-none justify-center rounded-full p-[3px] select-none"
      >
        <ScrollAreaPrimitive.Thumb
          className={cn(
            'w-full rounded-full bg-border-strong',
            'contrast-more:bg-foreground forced-colors:bg-[CanvasText]',
          )}
        />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}
