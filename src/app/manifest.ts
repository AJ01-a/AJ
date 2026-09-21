import type { MetadataRoute } from 'next';

/** See the note in robots.ts — required by `output: 'export'`. */
export const dynamic = 'force-static';

import { asset } from '@/config/base-path';
import { APP_NAME, APP_TAGLINE } from '@/config/site';

/**
 * Web app manifest.
 *
 * This makes the *website* installable as a shortcut. It is explicitly not a
 * substitute for the Android app: the games are not playable here, and the
 * description says so rather than implying otherwise.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description:
      `Download ${APP_NAME} for Android. This is the app's website, not the app itself.`,
    start_url: asset('/'),
    display: 'standalone',
    background_color: '#04060f',
    theme_color: '#04060f',
    orientation: 'portrait',
    icons: [
      { src: asset('/icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: asset('/icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: asset('/icons/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
