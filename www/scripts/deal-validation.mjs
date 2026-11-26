import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';

function isCalendarDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

function isDateTime(value) {
  const pattern =
    /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:[0-5]\d)$/i;
  return (
    pattern.test(value) && isCalendarDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value))
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
  const sponsorshipSchemaUrl = new URL('../../data/sponsorship.schema.json', import.meta.url);
  const sponsorshipSchema = JSON.parse(await readFile(sponsorshipSchemaUrl, 'utf8'));
  const categoriesUrl = new URL('../../data/categories.json', import.meta.url);
  const categories = JSON.parse(await readFile(categoriesUrl, 'utf8'));
  const ajv = new Ajv({ allErrors: true });

  ajv.addFormat('calendar-date', isCalendarDate);
  ajv.addFormat('date-time', isDateTime);
  ajv.addFormat('web-url', isWebUrl);
  ajv.addSchema(categories, 'categories.json');

  return {
    catalog: ajv.compile(schema),
    product: ajv.compile(productSchema),
    sponsorship: ajv.compile(sponsorshipSchema),
    sponsorSlotCount: sponsorshipSchema.properties.slots.maxItems,
    categoryIds: categories.oneOf.map((category) => category.const),
    formatErrors: (errors) => ajv.errorsText(errors, { separator: '\n' }),
  };
}

const validators = await createSchemaValidator();

export const sponsorSlotCount = validators.sponsorSlotCount;

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

export function validateSponsorship(sponsorship) {
  if (!validators.sponsorship(sponsorship)) {
    throw new Error(validators.formatErrors(validators.sponsorship.errors));
  }

  return sponsorship;
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

  for (const { id, lastDealIds = [] } of catalog.categories) {
    for (const dealId of lastDealIds) {
      if (!catalog.deals.some((deal) => deal.id === dealId && deal.categories.includes(id))) {
        throw new Error(`${catalog.year}: deal ${dealId} is not listed in category ${id}`);
      }
    }
  }
}

function validateCuratedDealReferences(catalog) {
  const productIds = new Set(catalog.deals.map((deal) => deal.id));
  for (const id of catalog.featuredDealIds ?? []) {
    if (!productIds.has(id)) {
      throw new Error(`${catalog.year}: featured deal ${id} does not exist in this catalog.`);
    }
  }

  for (const { dealId, afterDealId } of catalog.allDealsPlacements ?? []) {
    if (dealId === afterDealId || !productIds.has(dealId) || !productIds.has(afterDealId)) {
      throw new Error(
        `${catalog.year}: placing ${dealId} after ${afterDealId} requires two distinct deals in this catalog.`,
      );
    }
  }
}

function validateSponsorReferences(catalog) {
  const sponsors = (catalog.sponsorship?.slots ?? []).filter((slot) => 'dealId' in slot);
  const productIds = new Set(catalog.deals.map((deal) => deal.id));

  for (const { dealId, logo } of sponsors) {
    if (!productIds.has(dealId)) {
      throw new Error(`${catalog.year}: sponsor ${dealId} does not exist in this catalog.`);
    }

    if (logo.replace(/\.(svg|png)$/, '') !== dealId) {
      throw new Error(`${catalog.year}: sponsor logo ${logo} must be named after ${dealId}.`);
    }
  }

  assertUnique(
    sponsors.map((sponsor) => sponsor.dealId),
    'sponsor',
  );

  if (sponsors.filter((sponsor) => sponsor.house).length > 1) {
    throw new Error(`${catalog.year}: only one house sponsor slot is allowed.`);
  }
}

export function validateCatalog(catalog) {
  // Sponsorship files are schema-checked on read; here only their catalog references matter.
  const { deals, sponsorship, ...metadata } = catalog;
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
  validateCuratedDealReferences(catalog);
  validateSponsorReferences(catalog);

  return catalog;
}
