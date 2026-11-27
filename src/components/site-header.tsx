import { cn } from '../lib/utils';
import { Megaphone, Moon, Plus, Sun } from 'lucide-react';
import { repositoryUrl } from '../lib/deals';
import { sponsorPagePath } from '../lib/sponsors';
import { useTheme } from '../hooks/use-directory';
import { ArrowButton } from './ui/arrow-button';
import { Button } from './ui/button';
import { GitHubIcon } from './ui/github-icon';
import { Tooltip } from './ui/tooltip';

const navActionClassName = cn(
  'inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-full p-0',
  'pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-3.5',
);

const navSurfaceClassName = cn(
  'inline-flex min-h-8 min-w-8 items-center justify-center gap-1.5 rounded-full px-2.5',
  'text-xs font-medium transition-colors',
);

export function SiteHeader({ onContribute }: { onContribute: () => void }) {
  const { dark, toggleTheme } = useTheme();
  const themeAction = `Switch to ${dark ? 'light' : 'dark'} theme`;
  return (
    <header className="relative z-10">
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
            src="/favicon.svg?v=3"
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
              'group/sponsor text-muted-foreground hover:text-foreground max-[399px]:hidden',
            )}
            aria-label="Sponsor"
            href={sponsorPagePath}
          >
            <span
              className={cn(
                navSurfaceClassName,
                'group-hover/sponsor:bg-muted max-sm:size-8 max-sm:px-0',
              )}
            >
              <Megaphone aria-hidden="true" />
              <span className="hidden sm:inline">Sponsor</span>
            </span>
          </a>
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
          <ArrowButton
            variant="primary"
            aria-label="Submit a deal"
            aria-haspopup="dialog"
            onClick={onContribute}
            className={cn(
              'justify-center gap-1.5 text-xs whitespace-nowrap pointer-coarse:min-w-11',
              'max-[360px]:w-8 max-[360px]:p-0 max-[360px]:[&>[data-slot=arrow-icon]]:hidden',
            )}
          >
            <Plus aria-hidden="true" className="size-3.5 min-[360px]:hidden" />
            <span className="hidden sm:inline">Submit a deal</span>
            <span className="hidden min-[360px]:inline sm:hidden">Submit</span>
          </ArrowButton>
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
