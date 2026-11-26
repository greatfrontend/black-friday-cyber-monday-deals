import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';

function isCalendarDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

function isWebUrl(value) {
  try {
    const url = new URL(value);

    return (
      /^https?:$/.test(url.protocol) &&
      Boolean(url.hostname) &&
      !/\s/.test(value) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

async function createSchemaValidator() {
  const schemaUrl = new URL('../../data/deal-catalog.schema.json', import.meta.url);
  const schema = JSON.parse(await readFile(schemaUrl, 'utf8'));
  const productSchemaUrl = new URL('../../data/product.schema.json', import.meta.url);
  const productSchema = JSON.parse(await readFile(productSchemaUrl, 'utf8'));
  const categoriesUrl = new URL('../../data/categories.json', import.meta.url);
  const categories = JSON.parse(await readFile(categoriesUrl, 'utf8'));
  const ajv = new Ajv({ allErrors: true });

  ajv.addFormat('calendar-date', isCalendarDate);
  ajv.addFormat('web-url', isWebUrl);
  ajv.addSchema(categories, 'categories.json');

  return {
    catalog: ajv.compile(schema),
    product: ajv.compile(productSchema),
    categoryIds: categories.oneOf.map((category) => category.const),
    formatErrors: (errors) => ajv.errorsText(errors, { separator: '\n' }),
  };
}

const validators = await createSchemaValidator();

function validateCategoryIds(ids) {
  for (const id of ids) {
    if (!validators.categoryIds.includes(id)) {
      throw new Error(
        `Unknown category: ${id}. Choose one of: ${validators.categoryIds.join(', ')}`,
      );
    }
  }
}

export function validateProduct(product) {
  if (Array.isArray(product?.categories)) {
    validateCategoryIds(product.categories);
  }

  if (!validators.product(product)) {
    throw new Error(validators.formatErrors(validators.product.errors));
  }

  return product;
}

export function validateCatalogMetadata(metadata) {
  if (!validators.catalog(metadata)) {
    throw new Error(validators.formatErrors(validators.catalog.errors));
  }

  validateCategoryIds(metadata.categories.map((category) => category.id));
  assertUnique(
    metadata.categories.map((category) => category.id),
    'category ID',
  );
  assertUnique(
    metadata.categories.map((category) => category.heading),
    'category heading',
  );

  return metadata;
}

export function assertUnique(values, label) {
  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }

    seen.add(value);
  }
}

function validateCategoryReferences(catalog) {
  const categoryIds = new Set(catalog.categories.map((category) => category.id));

  for (const deal of catalog.deals) {
    for (const category of deal.categories) {
      if (!categoryIds.has(category)) {
        throw new Error(
          `${deal.id}: category ${category} is not listed in the ${catalog.year} catalog.`,
        );
      }
    }
  }
}

function validateFeaturedDealReferences(catalog) {
  const productIds = new Set(catalog.deals.map((deal) => deal.id));
  for (const id of catalog.featuredDealIds ?? []) {
    if (!productIds.has(id)) {
      throw new Error(`${catalog.year}: featured deal ${id} does not exist in this catalog.`);
    }
  }
}

export function validateCatalog(catalog) {
  const { deals, ...metadata } = catalog;
  validateCatalogMetadata(metadata);

  if (!Array.isArray(deals)) {
    throw new Error('Catalog deals must be an array.');
  }

  for (const { id, ...product } of deals) {
    if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      throw new Error(`Invalid product ID: ${id}`);
    }

    validateProduct(product);
  }
  assertUnique(
    catalog.deals.map((deal) => deal.id),
    'deal ID',
  );
  validateCategoryReferences(catalog);
  validateFeaturedDealReferences(catalog);

  return catalog;
}
