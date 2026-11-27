import { defineConfig } from 'vite-plus';
import { voidPlugin } from 'void';
import { voidReact } from '@void/react/plugin';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { exportCatalogs, readCatalogs, syncMarkdown } from './scripts/deal-data.mjs';

async function prepareCatalogs(checkMarkdown: boolean) {
  const catalogs = await readCatalogs();
  if (checkMarkdown) await syncMarkdown(catalogs);
  await exportCatalogs(catalogs);
}

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: process.env.VITEST
    ? []
    : [
        {
          name: 'ctrl-friday-catalogs',
          async configResolved({ command }) {
            if (command === 'build') await prepareCatalogs(true);
          },
          async configureServer() {
            await prepareCatalogs(false);
          },
        },
        tailwindcss(),
        voidPlugin(),
        voidReact({ react: { compiler: true } }),
      ],
  fmt: {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'lf',
    ignorePatterns: [
      '*.md',
      '.github/ISSUE_TEMPLATE/**',
      'archives/**',
      'assets/**',
      'data/**',
      'node_modules/**',
      'dist/**',
      '.void/**',
      '.cloudflare/**',
      '.wrangler/**',
      'public/data/**',
      'public/sponsors/**',
      'src/data/**',
      'pnpm-lock.yaml',
    ],
  },
  lint: { rules: { 'no-unused-vars': ['warn', { ignoreRestSiblings: true }] } },
  test: {
    include: ['scripts/*.test.mjs'],
    globalSetup: ['./scripts/test-setup.mjs'],
  },
});
