import { test, expect } from '@playwright/test';

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

test('all published pages load successfully', async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route);

    expect(response?.status(), `HTTP status for ${route}`).toBe(200);
    await expect(page.locator('body')).toContainText(/\S/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', /\S/);
  }
});

test('article pages expose one visible page heading', async ({ page }) => {
  await page.goto('/materials/anxiety-and-psychic-defenses/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});

test('article table of contents links to rendered headings', async ({ page }) => {
  await page.goto('/materials/anxiety-and-psychic-defenses/');

  const links = page.locator('[data-toc] a');
  await expect(links).toHaveCount(3);
  const targetsExist = await links.evaluateAll((items) =>
    items.every((item) => {
      const id = decodeURIComponent((item as HTMLAnchorElement).hash.slice(1));
      return document.getElementById(id) !== null;
    }),
  );
  expect(targetsExist).toBe(true);
});

test('search dialog opens, accepts a query, and closes with Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'جست‌وجو' }).click();

  const dialog = page.getByRole('dialog', { name: 'جست‌وجو در نوشته‌ها' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('searchbox', { name: 'عبارت جست‌وجو' }).fill('اضطراب');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('theme control toggles and persists the selected theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'تغییر به حالت تیره' });
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'تغییر به حالت روشن' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('site links resolve to published pages', async ({ page, request }) => {
  const origin = 'http://127.0.0.1:4321';
  const paths = new Set<string>();

  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((anchors) =>
        anchors
          .map((anchor) => anchor.getAttribute('href'))
          .filter((href): href is string => href !== null),
      );

    for (const href of hrefs) {
      paths.add(new URL(href, origin).pathname);
    }
  }

  for (const path of paths) {
    const response = await request.get(new URL(path, origin).href);
    expect(response.status(), `HTTP status for internal link ${path}`).toBe(200);
  }
});

test('unknown paths render the no-index 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('این صفحه در اینجا نیست.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
});
