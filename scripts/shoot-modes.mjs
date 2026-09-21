#!/usr/bin/env node
/**
 * Captures the two accessibility/capability fallbacks:
 *   - prefers-reduced-motion
 *   - WebGL unavailable
 *
 * Both are easy to ship broken because neither is what you see while
 * developing.
 */
import puppeteer from 'puppeteer';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:3000';
const outDir = 'shots/modes';
mkdirSync(outDir, { recursive: true });

const problems = [];

async function shoot(label, configure) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => problems.push(`[${label}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('manifest')) {
      problems.push(`[${label}] console: ${m.text()}`);
    }
  });

  await configure(page);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 2200));

  await page.screenshot({ path: `${outDir}/${label}-top.png` });

  // Part-way down, where the transformation would be.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.6));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: `${outDir}/${label}-mid.png` });

  // The download must be reachable in every mode.
  const reachable = await page.evaluate(() => {
    const el = document.getElementById('download');
    if (!el) return false;
    el.scrollIntoView();
    return Boolean(document.querySelector('button[aria-label^="Download"]'));
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${outDir}/${label}-download.png` });
  console.log(`${label}: download reachable = ${reachable}`);

  await browser.close();
}

await shoot('reduced-motion', async (page) => {
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
});

await shoot('no-webgl', async (page) => {
  // Make every WebGL context request fail, exactly as a blocked or
  // unsupported GPU would.
  await page.evaluateOnNewDocument(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).includes('webgl')) return null;
      return original.call(this, type, ...rest);
    };
  });
});

if (problems.length) {
  console.log('\nPROBLEMS:');
  for (const p of [...new Set(problems)]) console.log('  ' + p);
} else {
  console.log('\nNo errors in either mode.');
}
