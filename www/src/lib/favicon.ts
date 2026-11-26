export function getFaviconUrl(websiteUrl: string, imageSize = 64) {
  try {
    const website = new URL(websiteUrl);
    if (website.protocol !== 'https:' && website.protocol !== 'http:') return null;

    const source = new URL('https://www.google.com/s2/favicons');
    source.searchParams.set('domain_url', website.origin);
    source.searchParams.set('sz', String(imageSize));
    return source.href;
  } catch {
    return null;
  }
}
