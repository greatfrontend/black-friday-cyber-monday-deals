import { useEffect, useState } from 'react';

interface DealSelection {
  id: string;
  year: number;
}

interface DealDialogEntry {
  pathname: string;
  browseYear: string | null;
}

const dialogHistoryKey = 'ctrlFridayDealDialog';

function getDialogEntry() {
  const entry = window.history.state?.[dialogHistoryKey] as DealDialogEntry | undefined;
  return entry?.pathname === window.location.pathname ? entry : undefined;
}

export function readBrowseYear(params: URLSearchParams) {
  const entry = params.has('deal') ? getDialogEntry() : undefined;
  return entry ? entry.browseYear : params.get('year');
}

export function useDealDialog(currentYear: number) {
  const [selection, setSelection] = useState<DealSelection | null>(null);

  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('deal');
      const year = Number(params.get('year') ?? currentYear);
      setSelection(id ? { id, year } : null);
    }

    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [currentYear]);

  function openDeal(id: string, year: number) {
    const url = new URL(window.location.href);
    const alreadyOpen = url.searchParams.has('deal');
    const entry: DealDialogEntry = {
      pathname: url.pathname,
      browseYear: url.searchParams.get('year'),
    };
    url.searchParams.set('deal', id);
    url.searchParams.set('year', String(year));

    if (alreadyOpen) {
      window.history.replaceState(window.history.state, '', url);
    } else {
      window.history.pushState({ ...window.history.state, [dialogHistoryKey]: entry }, '', url);
    }
    setSelection({ id, year });
  }

  function closeDeal() {
    const url = new URL(window.location.href);
    setSelection(null);
    if (getDialogEntry()) {
      window.history.back();
      return;
    }

    url.searchParams.delete('deal');
    if (url.searchParams.get('year') === String(currentYear)) url.searchParams.delete('year');
    window.history.replaceState(window.history.state, '', url);
  }

  return { selection, openDeal, closeDeal };
}
