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

test('homepage category filters show only the selected section', async ({ page }) => {
  await page.goto('/');
  const filter = page.locator('[data-category-filter]');
  await expect(filter).toBeVisible();
  await filter.getByRole('button', { name: 'فلسفه' }).click();

  const visibleCards = page.locator('[data-filter-card]:visible');
  await expect(
    page.locator('[data-filter-card][data-article-section="psychoanalysis"]:visible'),
  ).toHaveCount(0);
  await expect(visibleCards).not.toHaveCount(0);
  const selectedSections = await visibleCards.evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-article-section')),
  );
  expect(new Set(selectedSections)).toEqual(new Set(['philosophy']));

  await filter.getByRole('button', { name: 'روانکاوی' }).click();
  await expect(
    page.locator('[data-filter-card][data-article-section="philosophy"]:visible'),
  ).toHaveCount(0);
  const psychoanalysisSections = await page
    .locator('[data-filter-card]:visible')
    .evaluateAll((cards) => cards.map((card) => card.getAttribute('data-article-section')));
  expect(new Set(psychoanalysisSections)).toEqual(new Set(['psychoanalysis']));
});

test('featured carousel pauses on hover', async ({ page }) => {
  await page.goto('/');
  const carousel = page.locator('[data-carousel]');
  await carousel.hover();
  await expect
    .poll(() =>
      page
        .locator('[data-carousel-track]')
        .evaluate((track) => getComputedStyle(track).animationPlayState),
    )
    .toBe('paused');
});

test('featured carousel supports pointer dragging', async ({ page }) => {
  await page.goto('/');
  const carousel = page.locator('[data-carousel]');
  const track = page.locator('[data-carousel-track]');
  await carousel.scrollIntoViewIfNeeded();
  const bounds = await carousel.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  const startX = bounds.x + bounds.width * 0.75;
  const y = bounds.y + bounds.height / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 100, y, { steps: 6 });
  await page.mouse.up();

  await expect
    .poll(() => track.evaluate((element) => (element as HTMLElement).style.animationDelay))
    .not.toBe('');
  await expect(track).not.toHaveClass(/is-dragging/);
  await expect(page).toHaveURL('/');
});

test('reduced motion disables the marquee without hiding content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const duration = await page
    .locator('[data-carousel-track]')
    .evaluate((track) => Number.parseFloat(getComputedStyle(track).animationDuration));
  expect(duration).toBeLessThan(0.001);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('article card image reveals finish in the visible state', async ({ page }) => {
  await page.goto('/');
  const imageReveal = page.locator('[data-article-card] .image-reveal').first();
  await imageReveal.scrollIntoViewIfNeeded();
  await expect(imageReveal).toHaveClass(/is-visible/);
  await expect(imageReveal).not.toHaveClass(/is-pending/);
});

test('article hero image opens and closes in the lightbox', async ({ page }) => {
  await page.goto('/materials/anxiety-and-psychic-defenses/');
  await page.getByRole('button', { name: /بزرگ‌نمایی تصویر/ }).click();

  const lightbox = page.getByRole('dialog', { name: 'نمایش بزرگ تصویر' });
  await expect(lightbox).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lightbox).not.toBeVisible();
});

test('article reading experience includes related stories and progress', async ({ page }) => {
  await page.goto('/materials/anxiety-and-psychic-defenses/');
  await expect(page.getByRole('heading', { name: 'نوشته‌های مرتبط' })).toBeVisible();
  const progress = page.locator('[data-reading-progress]');
  await expect(progress).toBeAttached();
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect
    .poll(() => progress.evaluate((element) => (element as HTMLElement).style.transform))
    .toBe('scaleX(1)');
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
