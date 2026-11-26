import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdown } from './deal-markdown.mjs';
import {
  assertUnique,
  validateCatalog,
  validateCatalogMetadata,
  validateProduct,
} from './deal-validation.mjs';

export const repoRoot = fileURLToPath(new URL('../../', import.meta.url));

async function listCatalogFiles(root) {
  const files = (await readdir(path.join(root, 'data/catalogs')))
    .filter((filename) => /^\d{4}\.json$/.test(filename))
    .sort();

  if (!files.length) {
    throw new Error('No annual catalogs found in data/catalogs/.');
  }

  return files;
}

async function readProduct(filename, directory) {
  const id = filename.slice(0, -'.json'.length);
  const file = path.join(directory, filename);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`${file}: use a lowercase, hyphen-separated product filename.`);
  }

  try {
    const product = validateProduct(JSON.parse(await readFile(file, 'utf8')));
    const { $schema, ...fields } = product;
    return { id, ...fields };
  } catch (error) {
    throw new Error(`${file}: ${error.message}`);
  }
}

async function readProducts(year, root) {
  const directory = path.join(root, 'data/deals', String(year));
  const filenames = (await readdir(directory)).filter((filename) => filename.endsWith('.json'));
  const products = await Promise.all(filenames.map((filename) => readProduct(filename, directory)));

  return products.sort((first, second) => {
    const order = (first.order ?? Infinity) - (second.order ?? Infinity);
    return order || first.id.localeCompare(second.id, 'en');
  });
}

async function readCatalog(filename, root) {
  const file = path.join(root, 'data/catalogs', filename);
  const metadata = validateCatalogMetadata(JSON.parse(await readFile(file, 'utf8')));

  if (filename !== `${metadata.year}.json`) {
    throw new Error(`${filename}: filename must match catalog.year`);
  }

  const deals = await readProducts(metadata.year, root);
  return validateCatalog({ ...metadata, deals });
}

export async function readCatalogs(root = repoRoot) {
  const files = await listCatalogFiles(root);
  const catalogs = await Promise.all(files.map((filename) => readCatalog(filename, root)));

  assertUnique(
    catalogs.map((catalog) => catalog.source),
    'Markdown source',
  );

  return catalogs;
}

export async function getMarkdownChanges(catalogs, root = repoRoot) {
  const changes = [];

  for (const catalog of catalogs) {
    const file = path.join(root, catalog.source);
    const original = await readFile(file, 'utf8');
    const rendered = renderMarkdown(catalog, original);

    if (original !== rendered) {
      changes.push({ file, rendered });
    }
  }

  return changes;
}

export async function syncMarkdown(catalogs, { root = repoRoot, write = false } = {}) {
  const changes = await getMarkdownChanges(catalogs, root);

  if (!write && changes.length) {
    throw new Error(
      'Markdown is out of sync. Run pnpm --dir www run data:sync and commit the updated tables.',
    );
  }

  for (const { file, rendered } of changes) {
    await writeFile(file, rendered);
  }

  return changes.length;
}

async function writeJson(file, value) {
  await writeFile(file, JSON.stringify(value, null, 2) + '\n');
}

function createCatalogIndex(catalogs) {
  return {
    currentYear: Math.max(...catalogs.map((catalog) => catalog.year)),
    catalogs: catalogs.map(({ year, title, lastChecked, deals }) => ({
      year,
      title,
      lastChecked,
      dealCount: deals.length,
      path: `/data/${year}.json`,
    })),
  };
}

async function readCategoryOptions(root) {
  const schema = JSON.parse(await readFile(path.join(root, 'data/categories.json'), 'utf8'));
  return schema.oneOf.map(({ const: id, title: name, description }) => ({ id, name, description }));
}

async function exportInitialData(catalogs, index, root) {
  const destination = path.join(root, 'www/src/data');
  await mkdir(destination, { recursive: true });
  const { $schema, ...catalog } = catalogs.find(({ year }) => year === index.currentYear);
  await writeJson(path.join(destination, 'initial-data.json'), { catalog, index });
}

export async function exportCatalogs(catalogs, root = repoRoot) {
  const destination = path.join(root, 'www/public/data');
  await mkdir(destination, { recursive: true });

  for (const { $schema, ...catalog } of catalogs) {
    await writeJson(path.join(destination, `${catalog.year}.json`), catalog);
  }

  const index = createCatalogIndex(catalogs);
  await writeJson(path.join(destination, 'index.json'), index);
  await exportInitialData(catalogs, index, root);
  const categories = await readCategoryOptions(root);
  await writeJson(path.join(destination, 'categories.json'), categories);
  await writeJson(path.join(root, 'www/src/data/categories.json'), categories);
}
