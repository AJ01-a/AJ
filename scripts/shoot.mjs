#!/usr/bin/env node
/**
 * Screenshots the site at a set of scroll positions and viewports.
 *
 * The whole point of this project is a scroll-driven sequence, so the only
 * way to review it is to look at it at several progress values. Console
 * errors are collected too, since a WebGL failure often shows up there
 * before it shows up on screen.
 *
 * Usage: node scripts/shoot.mjs [url] [label]
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:3000';
const label = process.argv[3] ?? 'run';
const outDir = `shots/${label}`;
mkdirSync(outDir, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, dsf: 1, mobile: false },
  { name: 'mobile', width: 390, height: 844, dsf: 2, mobile: true },
];

// Fractions of the pinned hero's scrollable range.
const HERO_STOPS = [0, 0.18, 0.34, 0.5, 0.66, 0.82, 1];

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    // Software WebGL, so the particle scene actually renders headlessly.
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--hide-scrollbars',
  ],
});

const problems = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: vp.dsf,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`[${vp.name}] console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`[${vp.name}] pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    problems.push(`[${vp.name}] request failed: ${req.url()} (${req.failure()?.errorText})`);
  });

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  // Let fonts settle and the first particle frames render.
  await new Promise((r) => setTimeout(r, 2500));

  const heroHeight = await page.evaluate(() => {
    const hero = document.querySelector('section[aria-label="Introduction"]');
    return hero ? hero.getBoundingClientRect().height - window.innerHeight : 0;
  });

  for (const stop of HERO_STOPS) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(heroHeight * stop));
    await new Promise((r) => setTimeout(r, 700));
    const name = `${vp.name}-hero-${String(Math.round(stop * 100)).padStart(3, '0')}`;
    await page.screenshot({ path: `${outDir}/${name}.png` });
  }

  // Each content section, framed on its own.
  const sections = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section[id]')).map((el) => el.id),
  );
  for (const id of sections) {
    if (!id || id === 'top') continue;
    await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40);
    }, id);
    await new Promise((r) => setTimeout(r, 650));
    await page.screenshot({ path: `${outDir}/${vp.name}-section-${id}.png` });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));

  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    horizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (metrics.horizontalOverflow) {
    problems.push(
      `[${vp.name}] HORIZONTAL OVERFLOW: scrollWidth ${metrics.scrollWidth} > ${metrics.clientWidth}`,
    );
  }
  console.log(`${vp.name}: page height ${metrics.scrollHeight}px`);

  await page.close();
}

await browser.close();

if (problems.length) {
  console.log('\nPROBLEMS:');
  for (const p of [...new Set(problems)]) console.log('  ' + p);
} else {
  console.log('\nNo console errors, failed requests or horizontal overflow.');
}
console.log(`\nScreenshots in ${outDir}/`);
