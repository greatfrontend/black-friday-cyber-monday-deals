import geistLatinUrl from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { defineHead } from 'void';

export const head = defineHead(() => ({
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
