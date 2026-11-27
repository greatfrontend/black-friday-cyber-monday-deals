import categories from '../data/categories.json' with { type: 'json' };

const legacyCategoryIds = new Map([
  ['courses', 'developer-courses'],
  ['ai-tools', 'general-ai-tools'],
]);

export const categoryLabels: Record<string, string> = Object.fromEntries(
  categories.map(({ id, name }) => [id, name]),
);

export function normalizeCategoryId(id: string): string {
  return legacyCategoryIds.get(id) ?? id;
}
