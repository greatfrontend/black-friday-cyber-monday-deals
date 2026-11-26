import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm',
    'font-medium transition-[color,background-color,border-color,box-shadow,transform]',
    'duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ),
  {
    variants: {
      variant: {
        default: 'border border-primary bg-primary text-primary-foreground hover:bg-primary/85',
        accent: 'border border-transparent bg-brand text-brand-foreground hover:bg-brand/80',
        outline:
          'border border-border bg-surface text-foreground hover:border-border-strong hover:bg-muted',
        ghost:
          'border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      },
      size: {
        default: 'min-h-10 px-3.5 py-2 pointer-coarse:min-h-11',
        sm: 'min-h-9 px-3 py-2 text-sm pointer-coarse:min-h-11',
        icon: 'size-9 p-2 pointer-coarse:size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
