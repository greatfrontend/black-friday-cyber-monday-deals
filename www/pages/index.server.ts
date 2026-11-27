import geistLatinUrl from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { defineHandler, defineHead, type InferProps } from 'void';

export const loader = defineHandler(() => ({ builtAt: new Date().toISOString() }));

export type Props = InferProps<typeof loader>;

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
