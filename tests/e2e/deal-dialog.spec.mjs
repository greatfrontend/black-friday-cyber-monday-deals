import { expect, test } from '@playwright/test';

const categoryUrl = '/?category=developer-tools';

async function openScrolledDeal(page) {
  await expect(page).toHaveURL(categoryUrl);
  await page.evaluate(() => window.scrollTo({ top: 2600, behavior: 'instant' }));

  const dealButtons = page
    .getByRole('list', { name: 'Deals', exact: true })
    .getByRole('button', { name: /^View details for / });
  let dealLabel;
  await expect
    .poll(async () => {
      dealLabel = await dealButtons.evaluateAll((buttons) => {
        return buttons
          .find((button) => {
            const { top, bottom } = button.getBoundingClientRect();
            return top > innerHeight / 3 && bottom < (innerHeight * 3) / 4;
          })
          ?.getAttribute('aria-label');
      });
      return dealLabel;
    })
    .toBeTruthy();

  // Playwright can scroll a virtualized card into view before dispatching the click.
  await page.evaluate(() => {
    window.scrollAtDealClick = new Promise((resolve) => {
      document.addEventListener('click', () => resolve(window.scrollY), {
        capture: true,
        once: true,
      });
    });
  });
  await page.getByRole('button', { name: dealLabel, exact: true }).click();
  const scrollPosition = await page.evaluate(() => window.scrollAtDealClick);
  expect(scrollPosition).toBeGreaterThan(1500);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/[?&]deal=[^&]+/);
  return scrollPosition;
}

async function expectCategoryPosition(page, scrollPosition) {
  await expect(page).toHaveURL(categoryUrl);
  await expect(page.getByRole('dialog', { includeHidden: true })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollPosition);
}

test.beforeEach(async ({ baseURL, context, page }) => {
  const origin = new URL(baseURL).origin;
  await context.route(
    (url) => url.origin !== origin,
    (route) => route.abort(),
  );
  await page.goto('/');
});

const dismissals = [
  ['the close button', (page) => page.getByRole('button', { name: 'Close dialog' }).click()],
  ['Escape', (page) => page.keyboard.press('Escape')],
  ['the backdrop', (page) => page.mouse.click(12, 12)],
];

for (const [name, dismiss] of dismissals) {
  test(`keeps the category scroll position when closing with ${name}`, async ({ page }) => {
    await page.getByRole('button', { name: /^Developer tools\b/ }).click();
    const scrollPosition = await openScrolledDeal(page);
    await dismiss(page);
    await expectCategoryPosition(page, scrollPosition);
  });
}

test('keeps the category scroll position when going Back and Forward', async ({ page }) => {
  await page.getByRole('button', { name: /^Developer tools\b/ }).click();
  const scrollPosition = await openScrolledDeal(page);
  const dealUrl = page.url();

  await page.goBack();
  await expectCategoryPosition(page, scrollPosition);

  await page.goForward();
  await expect(page).toHaveURL(dealUrl);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollPosition);
});

test('dismisses a shared deal link to its category in a fresh tab', async ({ context, page }) => {
  await page.getByRole('button', { name: /^Developer tools\b/ }).click();
  await openScrolledDeal(page);

  const sharedPage = await context.newPage();
  await sharedPage.goto(page.url());
  await expect(sharedPage.getByRole('dialog')).toBeVisible();
  await sharedPage.getByRole('button', { name: 'Close dialog' }).click();
  await expect(sharedPage).toHaveURL(categoryUrl);
  await expect(sharedPage.getByRole('button', { name: /^Developer tools\b/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(sharedPage.getByRole('dialog')).toHaveCount(0);
});

test.describe('on a mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('keeps the category scroll position when closing a deal', async ({ page }) => {
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Filter deals' });
    await drawer.getByRole('button', { name: /^Developer tools\b/ }).click();
    await drawer.getByRole('button', { name: /^Show .* deals/ }).click();
    await expect(drawer).toHaveCount(0);

    const scrollPosition = await openScrolledDeal(page);
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expectCategoryPosition(page, scrollPosition);
  });
});
