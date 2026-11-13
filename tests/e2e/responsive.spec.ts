import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/archive/',
  '/psychoanalysis/',
  '/philosophy/',
  '/materials/anxiety-and-psychic-defenses/',
];

test('key routes fit common mobile, tablet, and desktop widths', async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });

    for (const route of routes) {
      await page.goto(route);

      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth, `Horizontal overflow on ${route} at ${width}px`).toBeLessThanOrEqual(
        width,
      );
    }
  }
});

test('mobile navigation opens and exposes the site destinations', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await page.locator('.mobile-menu summary').click();

  const navigation = page.getByRole('navigation', { name: 'منوی موبایل' });
  await expect(navigation.getByRole('link', { name: 'خانه' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'آرشیو' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'روانکاوی' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'فلسفه' })).toBeVisible();
});
