import { startTransition, useEffect, useState } from 'react';
import { normalizeCategoryId } from '../lib/categories';
import { initializeTheme, themeStorageKey } from '../lib/theme-init';
import type { Catalog, CatalogIndex, Filters } from '../lib/types';
import { readBrowseYear } from './use-deal-dialog';

const searchDebounceMs = 300;

export function defaultFilters(year: number): Filters {
  return {
    query: '',
    category: 'all',
    year,
    sort: 'curated',
    savedOnly: false,
  };
}

function readFilters(index: CatalogIndex): Filters {
  const params = new URLSearchParams(window.location.search);
  const defaults = defaultFilters(index.currentYear);
  const year = Number(readBrowseYear(params));
  const sort = params.get('sort');
  return {
    ...defaults,
    query: params.get('q') ?? '',
    category: normalizeCategoryId(params.get('category') ?? 'all'),
    year: index.catalogs.some((catalog) => catalog.year === year) ? year : defaults.year,
    sort: sort === 'discount' || sort === 'name' ? sort : 'curated',
    savedOnly: params.get('saved') === '1',
  };
}

function writeFilters(filters: Filters, currentYear: number) {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries({
    q: filters.query,
    category: filters.category === 'all' ? '' : filters.category,
    ...(!url.searchParams.has('deal') && {
      year: filters.year === currentYear ? '' : String(filters.year),
    }),
    sort: filters.sort === 'curated' ? '' : filters.sort,
    saved: filters.savedOnly ? '1' : '',
  })) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  if (url.href !== window.location.href) {
    window.history.replaceState(window.history.state, '', url);
  }
}

export function useDirectoryFilters(index: CatalogIndex) {
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(index.currentYear));
  const [resultsQuery, setResultsQuery] = useState(filters.query);
  const [ready, setReady] = useState(false);
  const { query } = filters;

  useEffect(() => {
    const restore = () => {
      const restored = readFilters(index);
      setFilters(restored);
      setResultsQuery(restored.query);
    };
    restore();
    setReady(true);
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [index]);

  useEffect(() => {
    if (ready) writeFilters(filters, index.currentYear);
  }, [filters, index.currentYear, ready]);

  useEffect(() => {
    if (query === resultsQuery) return;
    const timer = window.setTimeout(() => {
      startTransition(() => setResultsQuery(query));
    }, searchDebounceMs);
    return () => window.clearTimeout(timer);
  }, [query, resultsQuery]);

  function updateFilters(changes: Partial<Filters>) {
    setFilters((previous) => ({ ...previous, ...changes }));
    if (changes.query !== undefined && changes.query.trim() === '') {
      setResultsQuery(changes.query);
    }
  }

  function clearFilters() {
    setFilters((previous) => defaultFilters(previous.year));
    setResultsQuery('');
  }

  return { filters, resultsQuery, updateFilters, clearFilters };
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
