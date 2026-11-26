import { Globe2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getFaviconUrl } from '../lib/favicon';
import { cn } from '../lib/utils';

interface ImageStatus {
  source: string;
  state: 'loaded' | 'error';
}

export function ProductMark({ websiteUrl, className }: { websiteUrl: string; className?: string }) {
  const source = getFaviconUrl(websiteUrl);
  const imageRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<ImageStatus | null>(null);
  const loaded = status?.source === source && status?.state === 'loaded';
  const failed = status?.source === source && status?.state === 'error';

  useEffect(() => {
    const image = imageRef.current;
    // Cached images can finish loading before React hydrates the static page.
    if (!source || !image?.complete) return;
    setStatus({ source, state: image.naturalWidth > 0 ? 'loaded' : 'error' });
  }, [source]);

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex size-10 shrink-0 items-center justify-center bg-transparent text-foreground',
        className,
      )}
    >
      {!loaded && <Globe2 className="size-7 text-muted-foreground" strokeWidth={1.5} />}
      {source && !failed && (
        <img
          ref={imageRef}
          src={source}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          draggable={false}
          className={cn('absolute size-8 object-contain', !loaded && 'opacity-0')}
          onLoad={() => setStatus({ source, state: 'loaded' })}
          onError={() => setStatus({ source, state: 'error' })}
        />
      )}
    </span>
  );
}
