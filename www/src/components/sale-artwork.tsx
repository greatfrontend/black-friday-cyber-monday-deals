import { useId } from 'react';
import { cn } from '../lib/utils';

interface SaleArtworkProps {
  year: number;
}

const ticketOutline =
  'M16 8H264Q272 8 272 16V76A14 14 0 0 0 272 104V164Q272 172 264 172H16Q8 172 8 164V104A14 14 0 0 0 8 76V16Q8 8 16 8Z';

function SaleTicket({ year }: SaleArtworkProps) {
  const clipId = useId();
  const hatchId = useId();

  return (
    <svg
      viewBox="0 0 280 180"
      className={cn('h-auto w-full overflow-visible opacity-25', 'max-[600px]:opacity-18')}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ticketOutline} />
        </clipPath>
        <pattern id={hatchId} width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M0 5 5 0" stroke="currentColor" strokeWidth="0.5" opacity="0.18" />
        </pattern>
      </defs>
      <path d={ticketOutline} fill="var(--art-paper)" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="198" y="8" width="74" height="164" fill="currentColor" fillOpacity="0.07" />
        <rect x="198" y="8" width="74" height="164" fill={`url(#${hatchId})`} />
        <path d="M198 9V171" stroke="currentColor" strokeDasharray="1 4" strokeLinecap="round" />
        <path
          d="M20 30V20H30M178 20H188V30M20 150V160H30M178 160H188V150"
          fill="none"
          stroke="currentColor"
          opacity="0.5"
        />
        <text
          x="30"
          y="36"
          fill="currentColor"
          fontSize="8"
          letterSpacing="1.5"
          className="font-mono"
        >
          THE {year} COLLECTION
        </text>
        <text x="28" y="74" fill="currentColor" fontSize="34" fontWeight="650" letterSpacing="-1.6">
          BLACK
        </text>
        <text
          x="28"
          y="108"
          fill="currentColor"
          fontSize="34"
          fontWeight="650"
          letterSpacing="-1.6"
        >
          FRIDAY
        </text>
        <path d="M30 121H174" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        <text
          x="30"
          y="141"
          fill="currentColor"
          fontSize="7"
          letterSpacing="1.4"
          className="font-mono"
        >
          TOOLS · COURSES · RESOURCES
        </text>
        <text
          x="235"
          y="43"
          textAnchor="middle"
          fill="currentColor"
          fontSize="7"
          letterSpacing="1.5"
          className="font-mono"
        >
          DEALS
        </text>
        <text x="235" y="99" textAnchor="middle" fill="currentColor" fontSize="48" fontWeight="450">
          %
        </text>
        <path
          d="M214 119V147M218 119V147M225 119V147M228 119V147M235 119V147M240 119V147M243 119V147M251 119V147M255 119V147"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>
      <path d={ticketOutline} fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// Alternating radii give the seal a precise die-cut edge rather than an irregular polygon.
function createSealEdge() {
  return (
    Array.from({ length: 48 }, (_, index) => {
      const angle = (index / 48) * Math.PI * 2 - Math.PI / 2;
      const radius = index % 2 === 0 ? 111 : 104;
      const x = (120 + Math.cos(angle) * radius).toFixed(2);
      const y = (120 + Math.sin(angle) * radius).toFixed(2);
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`;
    }).join(' ') + 'Z'
  );
}

const sealEdge = createSealEdge();

function SaleStamp({ year }: SaleArtworkProps) {
  const topArcId = useId();
  const bottomArcId = useId();

  return (
    <svg
      viewBox="0 0 240 240"
      className={cn('h-auto w-full overflow-visible opacity-25', 'max-[600px]:opacity-18')}
    >
      <defs>
        <path id={topArcId} d="M34 120A86 86 0 0 1 206 120" />
        <path id={bottomArcId} d="M42 126A78 78 0 0 0 198 126" />
      </defs>
      <path d={sealEdge} fill="var(--art-paper)" stroke="currentColor" strokeWidth="1.2" />
      <circle
        cx="120"
        cy="120"
        r="97"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <circle
        cx="120"
        cy="120"
        r="93"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="1 3"
        opacity="0.3"
      />
      <circle
        cx="120"
        cy="120"
        r="68"
        fill="currentColor"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <text
        fill="currentColor"
        fontSize="12"
        fontWeight="550"
        letterSpacing="3"
        textAnchor="middle"
      >
        <textPath href={`#${topArcId}`} startOffset="50%">
          CYBER MONDAY
        </textPath>
      </text>
      <text
        fill="currentColor"
        fontSize="8"
        letterSpacing="2.2"
        textAnchor="middle"
        className="font-mono"
      >
        <textPath href={`#${bottomArcId}`} startOffset="50%">
          COMMUNITY DEALS
        </textPath>
      </text>
      <path d="m34 115 4 6-4 6-4-6Zm172 0 4 6-4 6-4-6Z" fill="currentColor" />
      <text
        x="120"
        y="137"
        textAnchor="middle"
        fill="currentColor"
        fontSize="72"
        fontWeight="450"
        letterSpacing="-4"
      >
        %
      </text>
      <text
        x="120"
        y="163"
        textAnchor="middle"
        fill="currentColor"
        fontSize="9"
        letterSpacing="3"
        className="font-mono"
      >
        {year}
      </text>
    </svg>
  );
}

// Keep the ticket between the text and preview on wide screens.
export function SaleArtwork({ year }: SaleArtworkProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-clip',
        '[--art-offset:clamp(250px,calc(50vw-160px),720px)]',
      )}
    >
      <div
        className={cn(
          'absolute top-24 left-[calc(50%-var(--art-offset)-140px)] w-[280px] -rotate-12',
          'min-[821px]:top-11 min-[821px]:left-[calc(58%-140px)] min-[821px]:opacity-65',
          'text-[var(--art-ink)]',
          'motion-safe:animate-[ticket-settle_900ms_cubic-bezier(0.16,1,0.3,1)_both]',
        )}
      >
        <div className="motion-safe:animate-[art-float_5s_ease-in-out_infinite]">
          <SaleTicket year={year} />
        </div>
      </div>
      <div
        className={cn(
          'absolute top-20 left-[calc(50%+var(--art-offset)-120px)] w-60 rotate-12',
          'min-[821px]:top-5 min-[821px]:opacity-75',
          'text-[var(--art-ink)]',
          'motion-safe:animate-[stamp-affix_750ms_180ms_cubic-bezier(0.16,1,0.3,1)_both]',
        )}
      >
        <div className="motion-safe:animate-[seal-sway_6s_ease-in-out_-1.5s_infinite]">
          <SaleStamp year={year} />
        </div>
      </div>
    </div>
  );
}
