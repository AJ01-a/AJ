#!/usr/bin/env node
/**
 * Functional checks for the things that actually matter on this site:
 * the download flow works, the dialog is usable by keyboard, the APK is
 * really served, and nothing important is unreachable.
 */
import puppeteer from 'puppeteer';

const base = process.argv[2] ?? 'http://localhost:3000';
const results = [];
const check = (name, ok, detail = '') =>
  results.push({ name, ok, detail });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
// Warm the server first. A cold Next.js process compiles and caches on the
// first request, and measuring interactions against that produces flaky
// results that have nothing to do with the site.
await fetch(base).catch(() => {});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(base, { waitUntil: 'networkidle0', timeout: 90000 });
// Hydration has to finish before the dialog will respond to a click.
await page.waitForFunction(
  () => Boolean(document.querySelector('button[aria-label^="Download"]')),
  { timeout: 30000 },
);
// And the preloader has to have finished, because until it does it covers
// the page and swallows the click.
await page.waitForFunction(
  () =>
    document.querySelector('[data-preloader]')?.getAttribute('data-preloader') ===
    'done',
  { timeout: 30000 },
);
// One frame for the fade-out transition to stop intercepting pointer events.
await new Promise((r) => setTimeout(r, 900));

// ---- the APK is actually served -------------------------------------
const apkPath = await page.evaluate(() => {
  const link = document.querySelector('a[download]');
  return link ? link.getAttribute('href') : null;
});

// The dialog is closed at first, so read the configured path from the page.
const apkUrl = apkPath ?? '/downloads/retromind-arcade-1.0.0.apk';
const head = await fetch(new URL(apkUrl, base), { method: 'HEAD' });
check(
  'APK is served',
  head.ok,
  `${apkUrl} → ${head.status} ${head.headers.get('content-length') ?? '?'} bytes`,
);
const apkBytes = Number(head.headers.get('content-length') ?? 0);
check('APK is a plausible size', apkBytes > 5_000_000, `${(apkBytes / 1048576).toFixed(1)} MB`);

// ---- download flow ----------------------------------------------------
await page.evaluate(() => {
  document.getElementById('download')?.scrollIntoView();
});
await new Promise((r) => setTimeout(r, 600));

const openBtn = await page.$('button[aria-label^="Download RetroMind Arcade for Android"]');
check('Download button exists', Boolean(openBtn));

await openBtn?.click();
await new Promise((r) => setTimeout(r, 500));

const dialogState = await page.evaluate(() => {
  const dialog = document.querySelector('dialog');
  if (!dialog) return null;
  return {
    open: dialog.open,
    modal: dialog.matches(':modal'),
    labelled: Boolean(dialog.getAttribute('aria-labelledby')),
    focusInside: dialog.contains(document.activeElement),
    focused: document.activeElement?.textContent?.trim().slice(0, 30) ?? '',
    steps: dialog.querySelectorAll('ol li').length,
    downloadHref: dialog.querySelector('a[download]')?.getAttribute('href') ?? '',
  };
});

check('Dialog opens on click', dialogState?.open === true);
check('Dialog is modal (focus trapped, page inert)', dialogState?.modal === true);
check('Dialog is labelled for screen readers', dialogState?.labelled === true);
check('Focus moves into the dialog', dialogState?.focusInside === true, dialogState?.focused);
check('Install steps are listed', (dialogState?.steps ?? 0) >= 4, `${dialogState?.steps} steps`);
check(
  'Dialog download points at the APK',
  dialogState?.downloadHref?.endsWith('.apk') === true,
  dialogState?.downloadHref,
);

// Escape must close it.
await page.keyboard.press('Escape');
await new Promise((r) => setTimeout(r, 400));
const closedByEscape = await page.evaluate(
  () => document.querySelector('dialog')?.open === false,
);
check('Escape closes the dialog', closedByEscape);

// Cancel must close it too.
await openBtn?.click();
await new Promise((r) => setTimeout(r, 400));
const cancelled = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('dialog button'));
  const cancel = buttons.find((b) => b.textContent?.trim() === 'CANCEL');
  cancel?.click();
  return true;
});
await new Promise((r) => setTimeout(r, 400));
check(
  'Cancel closes the dialog',
  cancelled && (await page.evaluate(() => document.querySelector('dialog')?.open === false)),
);

// ---- keyboard access to the download --------------------------------
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1200));
await page.keyboard.press('Tab');
const firstStop = await page.evaluate(() => ({
  text: document.activeElement?.textContent?.trim() ?? '',
  href: document.activeElement?.getAttribute('href') ?? '',
}));
check(
  'First tab stop is the skip link to download',
  firstStop.href === '#download',
  `${firstStop.text} → ${firstStop.href}`,
);

// ---- structure --------------------------------------------------------
const structure = await page.evaluate(() => {
  const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => ({
    level: Number(h.tagName[1]),
    text: h.textContent?.trim().slice(0, 40) ?? '',
  }));
  const imgs = Array.from(document.querySelectorAll('img'));
  return {
    h1Count: headings.filter((h) => h.level === 1).length,
    headings: headings.slice(0, 8),
    imagesWithoutAlt: imgs.filter((i) => !i.getAttribute('alt')).length,
    title: document.title,
    description:
      document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
    lang: document.documentElement.lang,
    jsonLd: Boolean(document.querySelector('script[type="application/ld+json"]')),
  };
});
check('Exactly one h1', structure.h1Count === 1, `found ${structure.h1Count}`);
check('All images have alt text', structure.imagesWithoutAlt === 0);
check('Page title is set', structure.title.length > 10, structure.title);
check('Meta description is set', structure.description.length > 50);
check('Open Graph image declared', structure.ogImage.length > 0, structure.ogImage);
check('html lang is set', structure.lang === 'en');
check('Structured data present', structure.jsonLd);

// ---- legal pages ------------------------------------------------------
// Joined onto the base rather than resolved against it: `new URL('/privacy',
// 'http://host/AJ')` discards the /AJ, so a project-site deploy would be
// checked at the wrong path and look broken when it is not.
const root = base.replace(/\/+$/, '');
for (const name of ['privacy', 'terms', 'licenses']) {
  // The trailing slash is what a static export serves; a server build
  // redirects to the un-slashed form and fetch follows it.
  const res = await fetch(`${root}/${name}/`);
  check(`/${name} exists`, res.ok, `${res.status}`);
}

await browser.close();

const failed = results.filter((r) => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? '  ok  ' : ' FAIL '} ${r.name}${r.detail ? `  — ${r.detail}` : ''}`);
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exitCode = failed.length ? 1 : 0;
