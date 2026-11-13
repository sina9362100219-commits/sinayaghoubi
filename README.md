# روان‌کاوی با سینا

مجله‌ای فارسی دربارهٔ روان‌کاوی، فلسفه و پژوهش‌های روان‌شناختی. وب‌سایت با Astro و خروجی ایستا ساخته می‌شود؛ مقاله‌ها در Markdown نگهداری می‌شوند و تنظیمات انتشار Cloudflare در `wrangler.jsonc` قرار دارد.

## توسعه و اعتبارسنجی

پروژه به Node.js و وابستگی‌های ثبت‌شده در `package-lock.json` نیاز دارد:

```sh
npm ci
npm run dev
```

برای اجرای بررسی‌های پروژه:

```sh
npm run validate
```

برای ساخت خروجی استاتیک:

```sh
npm run build
```

خروجی در `dist/` قرار می‌گیرد. آزمون‌های مرورگر Playwright به مرورگر نصب‌شده نیاز دارند و تنظیمات آن در `playwright.config.ts` است.

## محتوا و طراحی

- مقاله‌ها در `src/content/materials/` و مطابق Content Collection موجود نگهداری شوند.
- فایل‌های تصویری مقاله در `public/images/articles/` و تصویرهای صفحهٔ اصلی در `public/images/hero/` قرار می‌گیرند.
- فونت‌های محلی و مجوزهایشان در `public/fonts/` نگهداری می‌شوند.
- توکن‌های طراحی، دستورهای استفاده از آیکون و راهنمای تصاویر در [راهنمای طراحی و نگهداری](./docs/design-system.md) آمده‌اند.

## انتشار

گردش‌کار [Validate site](./.github/workflows/validate.yml) روی Pull Requestها و هر push به `main` بررسی‌ها، تست‌ها و ساخت استاتیک را اجرا می‌کند. انتشار `main` همچنان به Git integration موجود Cloudflare واگذار شده تا هر push دوبار deploy نشود. برای این کار، اتصال مخزن و شاخهٔ `main` باید در تنظیمات Cloudflare مجاز و فعال باشد؛ workflow به Secret یا Token کلادفلر نیاز ندارد.

برای اجرای محلی، `npm run build` خروجی را در `dist/` می‌سازد. انتشار دستی با `npx wrangler deploy` نیازمند احراز هویت مجاز Cloudflare است. تنظیمات موجود در `wrangler.jsonc` را بدون دلیل فنی تغییر ندهید.
