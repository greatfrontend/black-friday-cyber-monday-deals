import { useEffect, useState } from 'react';
import { initializeTheme, themeStorageKey } from '../lib/theme-init';
import type { Catalog, CatalogIndex, Filters } from '../lib/types';

export function defaultFilters(year: number): Filters {
  return {
    query: '',
    category: 'all',
    year,
    sort: 'curated',
    savedOnly: false,
    couponOnly: false,
    discountOnly: false,
  };
}

function readFilters(index: CatalogIndex): Filters {
  const params = new URLSearchParams(window.location.search);
  const defaults = defaultFilters(index.currentYear);
  const year = Number(params.get('year'));
  const sort = params.get('sort');
  return {
    ...defaults,
    query: params.get('q') ?? '',
    category: params.get('category') ?? 'all',
    year: index.catalogs.some((catalog) => catalog.year === year) ? year : defaults.year,
    sort: sort === 'discount' || sort === 'name' ? sort : 'curated',
    savedOnly: params.get('saved') === '1',
    couponOnly: params.get('coupon') === '1',
    discountOnly: params.get('discount') === '50',
  };
}

function writeFilters(filters: Filters, currentYear: number) {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.year !== currentYear) params.set('year', String(filters.year));
  if (filters.sort !== 'curated') params.set('sort', filters.sort);
  if (filters.savedOnly) params.set('saved', '1');
  if (filters.couponOnly) params.set('coupon', '1');
  if (filters.discountOnly) params.set('discount', '50');
  const query = params.size ? `?${params}` : '';
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${query}${window.location.hash}`,
  );
}

export function useDirectoryFilters(index: CatalogIndex) {
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(index.currentYear));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = () => setFilters(readFilters(index));
    restore();
    setReady(true);
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [index]);

  useEffect(() => {
    if (ready) writeFilters(filters, index.currentYear);
  }, [filters, index.currentYear, ready]);

  function updateFilters(changes: Partial<Filters>) {
    setFilters((previous) => ({ ...previous, ...changes }));
  }

  function clearFilters() {
    setFilters((previous) => defaultFilters(previous.year));
  }

  return { filters, updateFilters, clearFilters };
}

export function useCatalog(initial: Catalog, year: number) {
  const [catalogs, setCatalogs] = useState<Record<number, Catalog>>({ [initial.year]: initial });
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const catalog = catalogs[year] ?? null;

  useEffect(() => {
    if (catalog) {
      setError('');
      return;
    }
    const controller = new AbortController();
    setError('');

    async function loadCatalog() {
      try {
        const response = await fetch(`/data/${year}.json`, { signal: controller.signal });
        if (!response.ok) throw new Error('Unable to load this collection.');
        const data = (await response.json()) as Catalog;
        if (data.year !== year || !Array.isArray(data.deals))
          throw new Error('Invalid collection.');
        setCatalogs((previous) => ({ ...previous, [year]: data }));
      } catch {
        if (!controller.signal.aborted)
          setError('We couldn’t load this collection. Please try again.');
      }
    }

    void loadCatalog();
    return () => controller.abort();
  }, [catalog, year, attempt]);

  return { catalog, error, retry: () => setAttempt((previous) => previous + 1) };
}

export function useSavedDeals() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    try {
      const data: unknown = JSON.parse(localStorage.getItem('gfe-deals:saved') ?? '[]');
      if (Array.isArray(data))
        setSaved(data.filter((key): key is string => typeof key === 'string'));
    } catch {
      /* Browsing still works when storage is unavailable. */
    }
  }, []);

  function toggleSaved(key: string) {
    const next = saved.includes(key) ? saved.filter((item) => item !== key) : [...saved, key];
    setSaved(next);
    try {
      localStorage.setItem('gfe-deals:saved', JSON.stringify(next));
    } catch {
      /* Keep this visit's selection in memory. */
    }
  }

  return { saved, toggleSaved };
}

export function useTheme() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const syncTheme = () => setDark(initializeTheme(themeStorageKey) === 'dark');
    // The head script already painted the correct theme; React reads that state.
    setDark(document.documentElement.dataset.theme === 'dark');
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === themeStorageKey || event.key === null) syncTheme();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      // Still apply the selected theme when storage is blocked.
    }
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', next);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#171717' : '#fafafa');
    setDark(next === 'dark');
  }

  return { dark, toggleTheme };
}
