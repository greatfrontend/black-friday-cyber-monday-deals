import type { ComponentProps } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  surface: {
    link: 'bg-surface text-foreground hover:bg-primary hover:text-primary-foreground',
    icon: 'bg-muted group-hover/arrow-button:bg-primary-foreground/15',
  },
  primary: {
    link: 'bg-primary text-primary-foreground hover:bg-primary/85',
    icon: 'bg-primary-foreground/15',
  },
  accent: {
    link: 'bg-brand text-brand-foreground hover:bg-brand/80',
    icon: 'bg-brand-foreground/15',
  },
};

interface ArrowStyles {
  direction?: 'right' | 'up-right';
  variant?: keyof typeof variants;
}

function arrowButtonClassName(variant: keyof typeof variants, className?: string) {
  return cn(
    'group/arrow-button inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full',
    'py-1 pr-1 pl-3 text-[13px] font-medium transition-colors duration-150 pointer-coarse:min-h-11',
    variants[variant].link,
    className,
  );
}

function ArrowIcon({ direction, variant }: Required<ArrowStyles>) {
  const diagonal = direction === 'up-right';
  const Arrow = diagonal ? ArrowUpRight : ArrowRight;

  return (
    <span
      aria-hidden="true"
      data-slot="arrow-icon"
      className={cn(
        'relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full',
        variants[variant].icon,
      )}
    >
      <Arrow
        className={cn(
          'absolute size-3.5 motion-safe:transition-transform motion-safe:duration-200',
          'motion-safe:group-hover/arrow-button:translate-x-6',
          diagonal && 'motion-safe:group-hover/arrow-button:-translate-y-6',
        )}
      />
      <Arrow
        className={cn(
          'absolute size-3.5 -translate-x-6 opacity-0',
          diagonal && 'translate-y-6',
          'motion-safe:transition-[translate,opacity] motion-safe:duration-200',
          'motion-safe:group-hover/arrow-button:translate-x-0 motion-safe:group-hover/arrow-button:translate-y-0',
          'motion-safe:group-hover/arrow-button:opacity-100',
        )}
      />
    </span>
  );
}

export function ArrowLink({
  direction = 'up-right',
  variant = 'surface',
  className,
  children,
  ...props
}: ComponentProps<'a'> & ArrowStyles) {
  return (
    <a {...props} className={arrowButtonClassName(variant, className)}>
      {children}
      <ArrowIcon direction={direction} variant={variant} />
    </a>
  );
}

export function ArrowButton({
  direction = 'right',
  variant = 'surface',
  type = 'button',
  className,
  children,
  ...props
}: ComponentProps<'button'> & ArrowStyles) {
  return (
    <button {...props} type={type} className={arrowButtonClassName(variant, className)}>
      {children}
      <ArrowIcon direction={direction} variant={variant} />
    </button>
  );
}
