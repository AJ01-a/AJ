/**
 * Central configuration for the RetroMind Arcade website.
 *
 * Everything that changes between releases or deployments lives here, so
 * shipping a new APK is a one-line edit rather than a search across the
 * codebase.
 *
 * Values marked PLACEHOLDER must be replaced before the site goes public.
 * They are deliberately obvious rather than plausible-looking, so nothing
 * fake can slip into production unnoticed.
 */

import { asset } from './base-path';

export const APP_NAME = 'RetroMind Arcade';
export const APP_TAGLINE = 'Classic fun. New challenges.';
export const APP_VERSION = '1.0.0';

/** Creator branding shown in the opening sequence. */
export const CREATOR_INITIALS = 'AJ';
export const CREATOR_NAME = 'AJ Almachar';
export const BUILT_WITH = 'Claude Code';

/**
 * Path to the Android package, served from `public/`.
 *
 * To ship a new build: drop the file in `public/downloads/`, update this
 * path and `APK_SIZE_LABEL`, and bump `APP_VERSION`. Nothing else changes.
 *
 * Keeping the version in the filename means browsers and CDNs never serve a
 * stale APK from cache.
 */
export const APK_DOWNLOAD_URL = asset(`/downloads/retromind-arcade-${APP_VERSION}.apk`);
export const APK_FILE_NAME = `retromind-arcade-${APP_VERSION}.apk`;

/**
 * Human-readable size of the file at APK_DOWNLOAD_URL.
 *
 * Measured from the arm64 release build. Update it whenever the APK is
 * replaced - `scripts/sync-apk.mjs` prints the correct value.
 */
export const APK_SIZE_LABEL = '22 MB';

/** ISO date the current APK was published. */
export const APK_UPDATED = '2026-09-21';

/**
 * Minimum Android version the app supports.
 *
 * This is API 24, which is Flutter's default `minSdkVersion` and what the
 * built APK actually declares — verified with `aapt2 dump badging`. Do not
 * state a lower version here without changing `minSdk` in the app's
 * build.gradle.kts and confirming the build still runs: an APK that will not
 * install is a worse first impression than an honest requirement.
 */
export const ANDROID_REQUIREMENT = 'Android 7.0 and newer';

/** Architectures the published APK supports. */
export const APK_ARCHITECTURE = 'arm64-v8a';

/**
 * App Store listing.
 *
 * The iOS build is configured in the app project but has not been submitted,
 * so there is no URL yet. Setting this to a real URL automatically turns the
 * "Coming soon" state into a working link - see `IOS_AVAILABLE`.
 */
export const APP_STORE_URL: string | null = null;
export const IOS_AVAILABLE = APP_STORE_URL !== null;

/**
 * Where people go with bugs, questions and privacy requests.
 *
 * A public issue tracker rather than an email address: it needs no domain
 * and no inbox to monitor, it cannot silently bounce, and the history is
 * visible to the next person with the same problem. The privacy notice and
 * terms point here too.
 */
export const SUPPORT_URL = 'https://github.com/AJ01-a/AJ/issues';
export const SUPPORT_LABEL = 'GitHub Issues';

/** Navigation targets, in document order. */
export const NAV_LINKS = [
  { href: '#about-app', label: 'About' },
  { href: '#categories', label: 'Categories' },
  { href: '#library', label: 'Games' },
  { href: '#why', label: 'Features' },
  { href: '#faq', label: 'FAQ' },
  { href: '#download', label: 'Download' },
] as const;

/**
 * Screenshots taken from the actual app, rendered from the Flutter project.
 * Nothing here is a mockup of a feature that does not exist.
 */
export const SCREENSHOTS = [
  { src: '/screenshots/dashboard.webp', alt: 'The RetroMind Arcade home dashboard showing the player level, the I’m Bored button and the daily challenge', label: 'Dashboard' },
  { src: '/screenshots/game-detail.webp', alt: 'The Star Lancer detail screen showing difficulty options, instructions and personal records', label: 'Game detail' },
  { src: '/screenshots/circuit-chase.webp', alt: 'Circuit Chase gameplay: a neon maze board with collectible nodes and patrolling hunters', label: 'Circuit Chase' },
  { src: '/screenshots/add-sprint.webp', alt: 'Add Sprint gameplay: an arithmetic question with four answer tiles', label: 'Add Sprint' },
  { src: '/screenshots/achievements.webp', alt: 'The achievements screen showing unlocked badges and progress bars', label: 'Achievements' },
  { src: '/screenshots/profile.webp', alt: 'The player profile showing level, streaks, time played and personal bests', label: 'Profile' },
] as const;
