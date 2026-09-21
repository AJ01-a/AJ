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
import { copyFileSync, mkdirSync, statSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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

// Read what the package actually declares, and compare it against what the
// site advertises. A mismatch here shipped once already: the site claimed
// Android 6.0 while the APK declared API 24 (Android 7.0), which would have
// meant a download that silently refuses to install.
const androidApiToVersion = {
  21: '5.0', 22: '5.1', 23: '6.0', 24: '7.0', 25: '7.1', 26: '8.0',
  27: '8.1', 28: '9', 29: '10', 30: '11', 31: '12', 33: '13', 34: '14',
  35: '15', 36: '16',
};

function inspectApk(file) {
  // aapt2 lives in the Android SDK build-tools. It is not always present,
  // so a missing tool is a warning rather than a failure.
  const sdk = process.env.ANDROID_HOME ?? `${process.env.HOME}/Library/Android/sdk`;
  let aapt2;
  try {
    const versions = readdirSync(`${sdk}/build-tools`).sort();
    aapt2 = `${sdk}/build-tools/${versions.at(-1)}/aapt2`;
    if (!existsSync(aapt2)) return null;
  } catch {
    return null;
  }
  try {
    const out = execFileSync(aapt2, ['dump', 'badging', file], { encoding: 'utf8' });
    return {
      minSdk: Number(out.match(/minSdkVersion:'(\d+)'/)?.[1] ?? 0),
      targetSdk: Number(out.match(/targetSdkVersion:'(\d+)'/)?.[1] ?? 0),
      versionName: out.match(/versionName='([^']+)'/)?.[1] ?? '',
      permissions: [...out.matchAll(/uses-permission: name='([^']+)'/g)].map((m) => m[1]),
    };
  } catch {
    return null;
  }
}

const info = inspectApk(dest);

const bytes = statSync(dest).size;
const mb = bytes / 1024 / 1024;
const label = `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;

console.log(`\n  Copied APK -> public/downloads/${destName}`);
console.log(`  Size: ${label} (${bytes.toLocaleString()} bytes)\n`);
console.log('  Confirm these values in src/config/site.ts:');
console.log(`    APP_VERSION     = '${version}'`);
console.log(`    APK_SIZE_LABEL  = '${label}'`);
console.log(`    APK_UPDATED     = '${new Date().toISOString().slice(0, 10)}'`);

if (info) {
  const required = androidApiToVersion[info.minSdk] ?? `API ${info.minSdk}`;
  console.log(`    ANDROID_REQUIREMENT should say 'Android ${required} and newer'`);
  console.log(`\n  The package declares: minSdk ${info.minSdk} (Android ${required}), ` +
    `targetSdk ${info.targetSdk}, version ${info.versionName}`);

  if (info.versionName && info.versionName !== version) {
    console.log(`\n  WARNING: the APK says version ${info.versionName}, but the site ` +
      `is configured for ${version}.`);
  }

  // The privacy claims rest on this, so it is worth restating every time.
  const real = info.permissions.filter((p) => !p.endsWith('DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'));
  console.log(`  User-facing permissions: ${real.length === 0 ? 'none' : real.join(', ')}`);
  if (real.length > 0) {
    console.log('\n  WARNING: the site and the privacy policy both state that the app');
    console.log('  requests no permissions. Update them, or remove the permission.');
  }
} else {
  console.log('\n  (aapt2 not found — could not verify minSdk, version or permissions');
  console.log('   against the package. Install Android build-tools to enable that check.)');
}
console.log('');
