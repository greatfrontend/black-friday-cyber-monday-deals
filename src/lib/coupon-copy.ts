import type { CopiedCoupon } from './types';

export function getCopiedCouponCode(copied: CopiedCoupon | null, year: number, dealId: string) {
  return copied?.year === year && copied.dealId === dealId ? copied.code : '';
}
