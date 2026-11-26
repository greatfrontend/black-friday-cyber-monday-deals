import geistLatinUrl from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { defineHead } from 'void';

const description =
  'Sponsor Ctrl Friday: a slot in the homepage hero, a pinned and highlighted deal card, and a place in the GitHub README. See the price, the rules and how to claim a slot.';

export const head = defineHead(() => ({
  title: 'Sponsor Ctrl Friday | Black Friday & Cyber Monday Deals for Developers',
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: 'Sponsor Ctrl Friday' },
    { property: 'og:description', content: description },
  ],
  link: [
    {
      rel: 'preload',
      as: 'font',
      type: 'font/woff2',
      href: geistLatinUrl,
      crossorigin: 'anonymous',
    },
  ],
}));
