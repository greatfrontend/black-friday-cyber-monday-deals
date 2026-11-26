import assert from 'node:assert/strict';
import test from 'node:test';
import { getCopiedCouponCode } from '../src/lib/coupon-copy.ts';

test('shared coupon feedback belongs only to the copied product and catalog year', () => {
  const copied = { year: 2026, dealId: 'tailgrids', code: 'BLFCM2026' };
  const products = [
    { year: 2026, id: 'next-js-templates' },
    { year: 2026, id: 'tailgrids' },
    { year: 2026, id: 'tailadmin' },
    { year: 2025, id: 'tailgrids' },
  ];

  assert.deepEqual(
    products.map(({ year, id }) => getCopiedCouponCode(copied, year, id)),
    ['', 'BLFCM2026', '', ''],
  );
});

test('cleared feedback has no copied code and copying another product changes the owner', () => {
  assert.equal(getCopiedCouponCode(null, 2026, 'tailgrids'), '');
  const copied = { year: 2026, dealId: 'tailadmin', code: 'BLFCM2026' };
  assert.equal(getCopiedCouponCode(copied, 2026, 'tailgrids'), '');
  assert.equal(getCopiedCouponCode(copied, 2026, 'tailadmin'), 'BLFCM2026');
});
