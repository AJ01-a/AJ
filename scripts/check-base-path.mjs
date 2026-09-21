#!/usr/bin/env node
/**
 * Fails if the static export references a root-relative URL that does not
 * carry the base path.
 *
 * A GitHub Pages project site is served from /<repo>, so `/icons/x.png`
 * resolves to the wrong origin and 404s. Next rewrites some of these itself
 * and silently leaves others alone — next/image `src` under
 * `images.unoptimized`, and metadata `icons`, were both found live this way,
 * after the narrower check that preceded this one passed. Enumerating the
 * cases did not work; scanning the output does.
 *
 *   node scripts/check-base-path.mjs out /AJ
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [dir = 'out', basePath = process.env.BASE_PATH ?? ''] = process.argv.slice(2);

if (!basePath) {
  console.log('No base path configured — nothing to check.');
  process.exit(0);
}

function* walk(root) {
  for (const name of readdirSync(root)) {
    const full = join(root, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (full.endsWith('.html') || full.endsWith('.webmanifest')) yield full;
  }
}

// Root-relative src/href/url values. Protocol-relative (//host) is excluded
// by requiring the next character not to be a slash.
const ATTR = /(?:src|href)="(\/(?!\/)[^"]*)"/g;
const JSON_URL = /"(?:src|start_url)":\s*"(\/(?!\/)[^"]*)"/g;

const problems = [];
for (const file of walk(dir)) {
  const text = readFileSync(file, 'utf8');
  const patterns = file.endsWith('.webmanifest') ? [JSON_URL] : [ATTR];
  for (const re of patterns) {
    for (const [, url] of text.matchAll(re)) {
      if (url === basePath || url.startsWith(`${basePath}/`)) continue;
      problems.push({ file, url });
    }
  }
}

if (problems.length) {
  console.error(
    `\n${problems.length} URL(s) missing the "${basePath}" prefix — these would 404 on a project site:\n`,
  );
  for (const { file, url } of problems.slice(0, 40)) {
    console.error(`  ${url}\n    in ${file}`);
  }
  console.error(
    '\nBuild them with asset() from src/config/base-path.ts.\n',
  );
  process.exit(1);
}

console.log(`All root-relative URLs carry the "${basePath}" prefix.`);
