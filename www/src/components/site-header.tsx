import { cn } from '../lib/utils';
import { Moon, Plus, Sun } from 'lucide-react';
import { repositoryUrl } from '../lib/deals';
import { useTheme } from '../hooks/use-directory';
import { Button } from './ui/button';
import { GitHubIcon } from './ui/github-icon';
import { Tooltip } from './ui/tooltip';

const navActionClassName = cn(
  'inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-md p-0',
  'pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-3.5',
);

const navSurfaceClassName = cn(
  'inline-flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2.5',
  'text-xs font-medium transition-colors',
);

export function SiteHeader({ onContribute }: { onContribute: () => void }) {
  const { dark, toggleTheme } = useTheme();
  const themeAction = `Switch to ${dark ? 'light' : 'dark'} theme`;
  return (
    <header className="sticky top-0 z-30 bg-background/88 backdrop-blur-lg">
      <div
        className={cn(
          'mx-auto w-[min(1320px,calc(100%-80px))] max-[850px]:w-[calc(100%-48px)]',
          'max-[600px]:w-[calc(100%-36px)] flex min-h-[var(--site-header-height)] items-center justify-between gap-3',
          'max-[600px]:gap-2',
        )}
      >
        <a
          href="/"
          aria-label="Ctrl Friday home, by GreatFrontEnd"
          className="inline-flex items-center gap-[9px] whitespace-nowrap"
        >
          <img
            src="/favicon.svg?v=2"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            className="size-8 shrink-0"
          />
          <span className="flex flex-col gap-1">
            <span className="text-base leading-none font-[650] tracking-[-0.035em] max-[600px]:text-sm">
              Ctrl Friday
            </span>
            <span className="flex items-center gap-1 text-[11px] leading-none text-muted-foreground">
              by
              <img
                src="/greatfrontend-wordmark.svg"
                alt="GreatFrontEnd"
                width={86}
                height={13}
                className="shrink-0 opacity-80 dark:invert"
              />
            </span>
          </span>
        </a>
        <nav aria-label="Primary" className="flex items-center gap-1 max-[600px]:gap-0">
          <a
            className={cn(
              navActionClassName,
              'group/github text-muted-foreground hover:text-foreground',
            )}
            aria-label="GitHub"
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              className={cn(
                navSurfaceClassName,
                'group-hover/github:bg-muted max-sm:size-8 max-sm:px-0',
              )}
            >
              <GitHubIcon className="size-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </span>
          </a>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Submit a deal"
            onClick={onContribute}
            className={cn(navActionClassName, 'group/submit gap-0 hover:bg-transparent')}
          >
            <span
              className={cn(
                navSurfaceClassName,
                'bg-primary text-primary-foreground',
                'group-hover/submit:bg-primary/85 max-[359px]:min-w-8 max-[359px]:px-0',
              )}
            >
              <Plus aria-hidden="true" />
              <span className="hidden sm:inline">Submit a deal</span>
              <span className="hidden min-[360px]:inline sm:hidden">Submit</span>
            </span>
          </Button>
          <Tooltip label={themeAction} side="bottom">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                navActionClassName,
                'group/theme size-9 hover:bg-transparent pointer-coarse:size-11',
              )}
              aria-label={themeAction}
              onClick={toggleTheme}
            >
              <span
                className={cn(
                  navSurfaceClassName,
                  'relative grid size-8 place-items-center p-0 group-hover/theme:bg-muted',
                )}
                aria-hidden="true"
              >
                <Sun
                  className={cn(
                    'absolute opacity-0 dark:opacity-100 motion-safe:-rotate-60 motion-safe:scale-50',
                    'motion-safe:transition-[opacity,transform] motion-safe:duration-[260ms]',
                    'motion-safe:dark:rotate-0 motion-safe:dark:scale-100',
                  )}
                />
                <Moon
                  className={cn(
                    'absolute opacity-100 dark:opacity-0 motion-safe:transition-[opacity,transform]',
                    'motion-safe:duration-[260ms] motion-safe:dark:rotate-60 motion-safe:dark:scale-50',
                  )}
                />
              </span>
            </Button>
          </Tooltip>
        </nav>
      </div>
    </header>
  );
}
