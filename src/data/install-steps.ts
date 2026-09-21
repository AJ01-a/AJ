import { APK_SIZE_LABEL } from '@/config/site';

/**
 * The sideloading instructions.
 *
 * Kept in a plain module rather than alongside the dialog component: the
 * dialog is a Client Component, and a `'use client'` module's exports become
 * client references when imported from a Server Component — so the permanent
 * install guide would receive a proxy instead of this array.
 */
export const INSTALL_STEPS = [
  {
    title: 'Download the APK',
    body:
      'Your browser may ask you to confirm the download. The file is about ' +
      `${APK_SIZE_LABEL}.`,
  },
  {
    title: 'Open the downloaded file',
    body: 'Tap it in your browser’s downloads, or find it in your Files app under Downloads.',
  },
  {
    title: 'Allow installation if Android asks',
    body:
      'Because this app does not come from Google Play, Android will ask whether ' +
      'to allow installs from your browser. Grant it only if you trust this source, ' +
      'and turn it off again afterwards if you prefer.',
  },
  {
    title: 'Complete the installation',
    body: 'Tap Install and wait for it to finish.',
  },
  {
    title: 'Open RetroMind Arcade',
    body: 'That’s it — no account, no setup, no connection needed.',
  },
] as const;
