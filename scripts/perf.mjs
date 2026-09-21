#!/usr/bin/env node
/**
 * Measures the production build: transfer weight, Web Vitals and the frame
 * rate during the scroll sequence.
 *
 * The frame-rate check matters most here — a site built around a scrubbed
 * particle system can pass every static metric and still feel terrible.
 */
import puppeteer from 'puppeteer';

const url = process.argv[2] ?? 'http://localhost:3000';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});

// ---- transfer weight --------------------------------------------------
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.setCacheEnabled(false);

const byType = new Map();
page.on('response', async (res) => {
  const url = res.url();
  if (url.startsWith('data:')) return;
  try {
    const buffer = await res.buffer();
    const type = res.request().resourceType();
    const entry = byType.get(type) ?? { bytes: 0, count: 0 };
    entry.bytes += buffer.length;
    entry.count += 1;
    byType.set(type, entry);
  } catch {
    /* redirects and aborted requests have no body */
  }
});

await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
await new Promise((r) => setTimeout(r, 2000));

console.log('Transfer weight on first load (uncached):');
let total = 0;
for (const [type, { bytes, count }] of [...byType.entries()].sort((a, b) => b[1].bytes - a[1].bytes)) {
  total += bytes;
  console.log(`  ${type.padEnd(12)} ${(bytes / 1024).toFixed(0).padStart(6)} KB  (${count})`);
}
console.log(`  ${'TOTAL'.padEnd(12)} ${(total / 1024).toFixed(0).padStart(6)} KB`);

// ---- Web Vitals -------------------------------------------------------
const vitals = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const out = { lcp: 0, cls: 0, ttfb: 0, fcp: 0 };
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) out.ttfb = Math.round(nav.responseStart);
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcp) out.fcp = Math.round(fcp.startTime);

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        out.lcp = Math.round(entries[entries.length - 1].startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) out.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });

      setTimeout(() => resolve(out), 1200);
    }),
);
console.log('\nWeb Vitals (desktop, software GPU):');
console.log(`  TTFB  ${vitals.ttfb} ms`);
console.log(`  FCP   ${vitals.fcp} ms`);
console.log(`  LCP   ${vitals.lcp} ms`);
console.log(`  CLS   ${vitals.cls.toFixed(4)}`);

// ---- frame rate through the scroll sequence ---------------------------
const fps = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const hero = document.querySelector('section[aria-label="Introduction"]');
      const range = hero ? hero.getBoundingClientRect().height - innerHeight : innerHeight;
      const frames = [];
      let last = performance.now();
      let scrolled = 0;
      const startedAt = last;

      function step(now) {
        frames.push(now - last);
        last = now;
        scrolled += range / 150; // traverse the hero over ~150 frames
        window.scrollTo(0, Math.min(scrolled, range));
        if (now - startedAt < 3000) requestAnimationFrame(step);
        else {
          const sorted = [...frames].sort((a, b) => a - b);
          resolve({
            frames: frames.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            worst: sorted[sorted.length - 1],
          });
        }
      }
      requestAnimationFrame(step);
    }),
);
console.log('\nFrame times while scrubbing the hero:');
console.log(`  frames  ${fps.frames}`);
console.log(`  median  ${fps.median.toFixed(1)} ms  (~${(1000 / fps.median).toFixed(0)} fps)`);
console.log(`  p95     ${fps.p95.toFixed(1)} ms`);
console.log(`  worst   ${fps.worst.toFixed(1)} ms`);
console.log('\n  Note: headless software rasterisation. Real GPUs are faster.');

await browser.close();
