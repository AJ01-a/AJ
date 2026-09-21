#!/usr/bin/env node
/**
 * Copies the release APK out of the Flutter build directory into `public/`
 * and reports the values that `src/config/site.ts` must carry.
 *
 * Run from the website directory:
 *   node scripts/sync-apk.mjs [path/to/app-release.apk]
 *
 * The default source is the arm64 split APK, which is the right one to hand
 * to a person downloading directly: it covers essentially every Android phone
 * shipped in the last several years and is a third the size of the universal
 * APK.
 */
import { copyFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const DEFAULT_SOURCE = resolve(
  root,
  '../build/app/outputs/flutter-apk/app-arm64-v8a-release.apk',
);

const source = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_SOURCE;

if (!existsSync(source)) {
  console.error(`\n  No APK at:\n    ${source}\n`);
  console.error('  Build one first, from the Flutter project root:');
  console.error('    flutter build apk --release --split-per-abi\n');
  process.exit(1);
}

// Read the version the site is configured for, so the filename always matches.
const config = await import('../src/config/site.ts').catch(() => null);
const version =
  config?.APP_VERSION ??
  (await import('node:fs')).readFileSync(resolve(root, 'src/config/site.ts'), 'utf8')
    .match(/APP_VERSION = '([^']+)'/)?.[1] ??
  '1.0.0';

const destDir = resolve(root, 'public/downloads');
const destName = `retromind-arcade-${version}.apk`;
const dest = resolve(destDir, destName);

mkdirSync(destDir, { recursive: true });
copyFileSync(source, dest);

const bytes = statSync(dest).size;
const mb = bytes / 1024 / 1024;
const label = `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;

console.log(`\n  Copied APK -> public/downloads/${destName}`);
console.log(`  Size: ${label} (${bytes.toLocaleString()} bytes)\n`);
console.log('  Confirm these values in src/config/site.ts:');
console.log(`    APP_VERSION     = '${version}'`);
console.log(`    APK_SIZE_LABEL  = '${label}'`);
console.log(`    APK_UPDATED     = '${new Date().toISOString().slice(0, 10)}'\n`);
