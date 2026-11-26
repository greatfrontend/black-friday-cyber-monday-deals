import { defineConfig } from 'vite-plus';
import { voidPlugin } from 'void';
import { voidReact } from '@void/react/plugin';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [tailwindcss(), voidPlugin(), voidReact({ react: { compiler: true } })],
  fmt: {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'lf',
    ignorePatterns: [
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
});
