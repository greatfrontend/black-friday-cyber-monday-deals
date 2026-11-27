export const themeStorageKey = 'gfe-deals:theme';

// Self-contained so Void can place this function in a blocking head script.
export function initializeTheme(storageKey: string) {
  let theme = 'dark';
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') theme = stored;
  } catch {
    // Dark is also the fallback when storage is unavailable.
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#171717' : '#fafafa');
  return theme;
}

export const themeInitScript = `(${initializeTheme.toString()})(${JSON.stringify(themeStorageKey)});`;
