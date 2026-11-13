import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/archive/',
  '/psychoanalysis/',
  '/philosophy/',
  '/materials/anxiety-and-psychic-defenses/',
  '/materials/dreams-and-meaning/',
  '/materials/freedom-and-responsibility/',
  '/materials/nietzsche-poet-and-philosopher/',
  '/materials/truth-and-interpretation/',
  '/materials/unconscious-in-everyday-life/',
];

for (const route of routes) {
  test(`accessibility audit: ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations, `Accessibility violations on ${route}`).toEqual([]);
  });
}

test('dark theme accessibility audit', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'تغییر به حالت تیره' }).click();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations, 'Accessibility violations in dark theme').toEqual([]);
});
