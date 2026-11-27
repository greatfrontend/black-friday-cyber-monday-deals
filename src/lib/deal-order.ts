import type { DealPlacement } from './types';

export function moveDealAfter<T extends { id: string }>(
  deals: T[],
  { dealId, afterDealId }: DealPlacement,
) {
  const deal = deals.find(({ id }) => id === dealId);
  if (!deal) return deals;

  const ordered = deals.filter(({ id }) => id !== dealId);
  const anchorIndex = ordered.findIndex(({ id }) => id === afterDealId);
  if (anchorIndex === -1) return deals;

  ordered.splice(anchorIndex + 1, 0, deal);
  return ordered;
}

export function moveDealsToEnd<T extends { id: string }>(deals: T[], lastDealIds: string[] = []) {
  if (lastDealIds.length === 0) return deals;

  const positions = new Map(lastDealIds.map((id, index) => [id, index]));
  return [...deals].sort(
    (first, second) => (positions.get(first.id) ?? -1) - (positions.get(second.id) ?? -1),
  );
}
