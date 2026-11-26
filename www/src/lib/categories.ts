import categories from '../data/categories.json' with { type: 'json' };

export const categoryLabels: Record<string, string> = Object.fromEntries(
  categories.map(({ id, name }) => [id, name]),
);
