import { cn } from '../lib/utils';
import { ArrowUpRight } from 'lucide-react';
import { repositoryUrl } from '../lib/deals';

export function SiteFooter({ year, onContribute }: { year: number; onContribute: () => void }) {
  return (
    <footer
      className={cn(
        'pt-6 pb-8 mx-auto w-[min(1320px,calc(100%-80px))] max-[850px]:w-[calc(100%-48px)]',
        'max-[600px]:w-[calc(100%-36px)]',
      )}
    >
      <div className="flex items-center justify-between gap-6 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-4">
        <div>
          <a
            className="inline-flex items-center gap-[5px] text-[15px] font-semibold tracking-tight"
            href="https://www.greatfrontend.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GreatFrontEnd <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-muted-foreground">
            A community-maintained collection. Contributions welcome.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-6 text-[13px] max-[600px]:gap-5">
          <a
            className={cn(
              'group inline-flex min-h-9 pointer-coarse:min-h-11 cursor-pointer items-center gap-1 text-foreground',
              'hover:underline hover:underline-offset-4',
            )}
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Source on GitHub{' '}
            <ArrowUpRight
              className={cn(
                'size-3 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5',
                'motion-safe:group-hover:-translate-y-0.5',
              )}
              aria-hidden="true"
            />
          </a>
          <button
            className={cn(
              'group inline-flex min-h-9 pointer-coarse:min-h-11 cursor-pointer items-center gap-1 text-foreground',
              'hover:underline hover:underline-offset-4',
            )}
            type="button"
            onClick={onContribute}
          >
            Submit a deal{' '}
            <ArrowUpRight
              className={cn(
                'size-3 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5',
                'motion-safe:group-hover:-translate-y-0.5',
              )}
              aria-hidden="true"
            />
          </button>
        </nav>
      </div>
      <div
        className={cn(
          'mt-6 flex items-end justify-between gap-8 text-xs leading-[1.65] text-muted-foreground',
          'max-[600px]:mt-4 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3',
          '[&>p]:max-w-[650px] [&>span]:shrink-0',
        )}
      >
        <p>
          Some links are affiliate links; we may earn a commission at no extra cost to you. Check
          the seller’s site for current prices and terms.
        </p>
        <span>© {year} GreatFrontEnd</span>
      </div>
    </footer>
  );
}
