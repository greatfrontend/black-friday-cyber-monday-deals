import { useState, type ReactNode } from 'react';
import { ArrowUpRight, BookOpen, Megaphone, PanelTop, Pin, Tag, Users } from 'lucide-react';
import type { Catalog, Sponsorship } from '../lib/types';
import { formatCheckedDate, repositoryUrl } from '../lib/deals';
import { formatSlotAvailability, getActiveSponsorship, getSponsoredDealIds } from '../lib/sponsors';
import { cn } from '../lib/utils';
import { useDealDialog } from '../hooks/use-deal-dialog';
import { ContributeDialog } from './contribute-dialog';
import { DealDetail } from './deal-detail';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { SponsorCheckout } from './sponsor-checkout';
import { SponsorSlots } from './sponsor-slots';

const sponsorGuideUrl = `${repositoryUrl}/blob/main/SPONSORS.md`;

const shellClassName = cn(
  'mx-auto w-[min(1320px,calc(100%-80px))] max-[850px]:w-[calc(100%-48px)]',
  'max-[600px]:w-[calc(100%-36px)]',
);

const linkClassName = 'font-medium text-foreground underline underline-offset-4 hover:no-underline';

const perks = [
  {
    icon: PanelTop,
    title: 'A slot in the homepage hero',
    body: 'Your logo, product name, and discount appear in the sponsor grid. Selecting the ticket opens your deal.',
  },
  {
    icon: Pin,
    title: 'A pinned deal card',
    body: 'Your deal is listed first in All deals and in its category, ahead of unsponsored deals, in the default order.',
  },
  {
    icon: Tag,
    title: 'A highlighted listing',
    body: 'Your deal card and detail view display a Sponsored label.',
  },
  {
    icon: BookOpen,
    title: 'A place in the README',
    body: 'Your logo and link in the Sponsors block near the top of the project’s GitHub README.',
  },
  {
    icon: Megaphone,
    title: 'A roundup post',
    body: 'One post on GreatFrontEnd’s socials (LinkedIn, Instagram, X) naming every sponsor, published during Cyber Monday.',
  },
  {
    icon: Users,
    title: 'GreatFrontEnd’s social audience',
    body: (
      <>
        <span className="font-medium text-foreground">91K</span> followers on LinkedIn,{' '}
        <span className="font-medium text-foreground">42.6K</span> on Instagram, and{' '}
        <span className="font-medium text-foreground">9.6K</span> on X. As of{' '}
        <time dateTime="2026-11-27">27 Nov 2026</time>.
      </>
    ),
  },
];

const eligibility = [
  'A real Black Friday or Cyber Monday offer, live now or with a stated start date.',
  'A product made for developers or designers.',
  'Accurate names, prices, discounts and dates.',
  'A logo and name you have the right to use.',
];

const expectations = [
  'Every placement is labelled Sponsored, and its links carry rel="sponsored".',
  'We may decline a product, or edit a listing for accuracy.',
  'A slot buys placement, not results. We don’t promise clicks, sign-ups or sales.',
];

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className={cn(
        'grid gap-x-10 gap-y-5 border-t border-border py-10',
        'min-[851px]:grid-cols-[220px_minmax(0,1fr)] max-[600px]:py-8',
      )}
    >
      <h2 className="text-xl leading-7 font-medium tracking-tight">{title}</h2>
      <div className="min-w-0 max-w-[760px]">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[14px_minmax(0,1fr)]">
          <span aria-hidden="true">·</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function ContactLink({ sponsorship }: { sponsorship: Sponsorship }) {
  if (sponsorship.contactEmail) {
    return (
      <a className={linkClassName} href={`mailto:${sponsorship.contactEmail}`}>
        {sponsorship.contactEmail}
      </a>
    );
  }

  return (
    <a
      className={linkClassName}
      href={`${repositoryUrl}/issues`}
      target="_blank"
      rel="noopener noreferrer"
    >
      open an issue on GitHub
    </a>
  );
}

function SponsorshipDetails({ year, sponsorship }: { year: number; sponsorship: Sponsorship }) {
  const price = `$${sponsorship.priceUsd}`;
  const endDate = formatCheckedDate(sponsorship.endsOn);
  const steps = [
    {
      title: 'Check the rules',
      body: 'Make sure your offer meets the eligibility rules below.',
    },
    {
      title: 'Pay on Stripe',
      body: `${price}, one-time. Stripe emails you a receipt. Keep its receipt number.`,
    },
    {
      title: 'Open a pull request',
      body: (
        <>
          Add your deal, your logo and your slot entry, and put the receipt number in the
          description.{' '}
          <a
            className={linkClassName}
            href={sponsorGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            SPONSORS.md
          </a>{' '}
          lists the exact files.
        </>
      ),
    },
    {
      title: 'We verify and review',
      body: 'We match the receipt to your payment and check the listing, typically within one business day.',
    },
    {
      title: 'You go live',
      body: 'Your slot, pinned card and README logo appear once the pull request is merged and the site redeploys.',
    },
  ];
  const questions = [
    {
      question: 'Can I change my deal after it is live?',
      answer: 'Yes. Open another pull request against your deal file whenever your offer changes.',
    },
    {
      question: 'What logo should I provide?',
      answer:
        'A square SVG or PNG under 100 KB, with its own solid background so it reads on light and dark themes. A PNG should be at least 256 by 256 pixels.',
    },
    {
      question: `What happens after ${endDate}?`,
      answer: `Sponsor placements end. Your deal stays in the ${year} collection as a regular listing.`,
    },
    {
      question: 'Do I need a GitHub account?',
      answer: 'Yes, to open the pull request. If that is a problem, get in touch before paying.',
    },
  ];

  return (
    <>
      <Section title="What you get">
        <ul className="grid gap-x-8 gap-y-6 min-[700px]:grid-cols-2">
          {perks.map(({ icon: Icon, title, body }) => (
            <li key={title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3.5">
              <span className="grid size-9 place-items-center rounded-lg bg-muted">
                <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm leading-5 font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          Placements run until{' '}
          <time dateTime={sponsorship.endsOn} className="font-medium text-foreground">
            {endDate}
          </time>
          . Sponsors are ordered by when they paid.
        </p>
      </Section>
      <Section id="next-steps" title="How it works">
        <ol className="space-y-5">
          {steps.map(({ title, body }, index) => (
            <li key={title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3.5">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-lg bg-muted font-mono text-xs"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm leading-5 font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <Section title="Eligibility">
        <BulletList items={eligibility} />
        <h3 className="mt-7 mb-2 text-sm leading-5 font-semibold">What to expect</h3>
        <BulletList items={expectations} />
      </Section>
      <Section title="Refunds">
        <p className="text-sm leading-6 text-pretty text-muted-foreground">
          You get a full refund if we decline your product, if every slot was taken before your
          payment arrived, or if you withdraw before your pull request is merged. Once your
          placement is live, payments are not refunded.
        </p>
      </Section>
      <Section title="Questions">
        <dl className="space-y-5">
          {questions.map(({ question, answer }) => (
            <div key={question}>
              <dt className="text-sm leading-5 font-semibold">{question}</dt>
              <dd className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">{answer}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-7 text-sm leading-6 text-muted-foreground">
          For anything else, including refund requests, <ContactLink sponsorship={sponsorship} />.
        </p>
      </Section>
    </>
  );
}

export function SponsorPage({ catalog }: { catalog: Catalog }) {
  const [contributing, setContributing] = useState(false);
  const { selection, openDeal, closeDeal } = useDealDialog(catalog.year);
  const [copiedCode, setCopiedCode] = useState('');
  const sponsorship = getActiveSponsorship(catalog);
  const selectedDeal =
    selection?.year === catalog.year
      ? catalog.deals.find((deal) => deal.id === selection.id)
      : undefined;

  async function copyCoupon(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch {
      setCopiedCode('');
    }
  }

  return (
    <>
      <SiteHeader onContribute={() => setContributing(true)} />
      <main className={cn(shellClassName, 'pb-10')}>
        {sponsorship ? (
          <>
            <section
              aria-labelledby="sponsor-title"
              className={cn(
                'grid items-center gap-x-8 gap-y-8 pt-10 pb-12 max-[600px]:pt-6 max-[600px]:pb-9',
                'min-[821px]:grid-cols-[minmax(0,1fr)_minmax(300px,34%)]',
              )}
            >
              <div className="min-w-0">
                <h1
                  id="sponsor-title"
                  className={cn(
                    'max-w-[16ch] font-heading text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.08]',
                    'font-medium tracking-[-0.05em] text-balance',
                    'max-[600px]:text-[clamp(1.75rem,7.5vw,2.75rem)]',
                  )}
                >
                  Put your deal at the top of Ctrl Friday.
                </h1>
                <p className="mt-4 max-w-[52ch] text-base leading-7 text-pretty text-muted-foreground">
                  Slots sit in the homepage hero, above every other deal, in front of developers and
                  designers shopping{' '}
                  <span className="font-medium text-foreground">Black Friday and Cyber Monday</span>
                  .
                </p>
                <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
                  {[
                    ['Price', `$${sponsorship.priceUsd}, one-time`],
                    ['Live until', formatCheckedDate(sponsorship.endsOn)],
                    ['Availability', formatSlotAvailability(sponsorship)],
                  ].map(([term, detail]) => (
                    <div key={term}>
                      <dt className="text-xs leading-4 text-muted-foreground">{term}</dt>
                      <dd className="mt-1 text-base leading-6 font-semibold tracking-tight">
                        {detail}
                      </dd>
                    </div>
                  ))}
                </dl>
                <SponsorCheckout
                  year={catalog.year}
                  sponsorship={sponsorship}
                  contact={<ContactLink sponsorship={sponsorship} />}
                />
              </div>
              <div>
                <SponsorSlots
                  catalog={catalog}
                  sponsorship={sponsorship}
                  sponsorHref="#become-a-sponsor"
                  onDetails={(deal) => openDeal(deal.id, catalog.year)}
                />
                <p className="mx-auto mt-3 max-w-[444px] text-xs leading-5 text-muted-foreground min-[821px]:mr-0">
                  These are the current homepage slots. Open slots show a plus sign.
                </p>
              </div>
            </section>
            <SponsorshipDetails year={catalog.year} sponsorship={sponsorship} />
          </>
        ) : (
          <section aria-labelledby="sponsor-title" className="max-w-[60ch] py-16">
            <h1
              id="sponsor-title"
              className="font-heading text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.04em]"
            >
              Sponsor slots for {catalog.year} are closed.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              You can still list a deal for free.{' '}
              <a className={linkClassName} href="/">
                Browse the deals
              </a>{' '}
              or use Submit a deal in the header.
            </p>
          </section>
        )}
      </main>
      <SiteFooter year={catalog.year} onContribute={() => setContributing(true)} />
      <DealDetail
        deal={selectedDeal ?? null}
        year={catalog.year}
        status={selection && !selectedDeal ? 'unavailable' : undefined}
        sponsored={selectedDeal && getSponsoredDealIds(catalog).includes(selectedDeal.id)}
        onClose={closeDeal}
        onCopy={(code) => void copyCoupon(code)}
        copiedCode={copiedCode}
      />
      <ContributeDialog open={contributing} onOpenChange={setContributing} year={catalog.year} />
    </>
  );
}
