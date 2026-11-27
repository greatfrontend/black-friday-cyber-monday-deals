import { cn } from '../lib/utils';
import { ArrowUpRight, FileJson, GitFork, Plus } from 'lucide-react';
import { buildSuggestionUrl, repositoryUrl } from '../lib/deals';
import { Dialog } from './ui/dialog';
import { buttonVariants } from './ui/button';

export function ContributeDialog({
  open,
  onOpenChange,
  year,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Contribute a deal"
      description="Add an offer or correct an existing listing through GitHub."
    >
      <div className="mt-6 space-y-3">
        <a
          className={cn(
            'flex items-start gap-3.5 rounded-md border border-border p-4 transition-colors',
            'duration-150 hover:border-border-strong hover:bg-muted',
          )}
          href={buildSuggestionUrl(undefined, year)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <span className="grow">
            <span className="block text-sm font-semibold">Suggest a deal</span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">
              Share the product, offer, coupon, and source in our GitHub form.
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
        <a
          className={cn(
            'flex items-start gap-3.5 rounded-md border border-border p-4 transition-colors',
            'duration-150 hover:border-border-strong hover:bg-muted',
          )}
          href={`${repositoryUrl}/tree/main/data/deals/${year}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
            <FileJson className="size-5" aria-hidden="true" />
          </span>
          <span className="grow">
            <span className="block text-sm font-semibold">Make a pull request</span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">
              One product, one JSON file. Add a product or improve an existing offer.
            </span>
          </span>
          <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
        <p className="pt-2 text-sm leading-6 text-muted-foreground">
          You’ll continue on GitHub to review and submit your contribution. A GitHub account is
          required. Suggestions aren’t published automatically.
        </p>
        <a
          href={`${repositoryUrl}/blob/main/CONTRIBUTING.md`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: 'ghost', className: 'mt-2 w-full' })}
        >
          <GitFork aria-hidden="true" />
          Read the contribution guide
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </Dialog>
  );
}
