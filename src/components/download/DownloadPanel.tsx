'use client';

import { useState } from 'react';

import InstallDialog from './InstallDialog';
import MagneticButton from '@/components/ui/MagneticButton';
import { useSound } from '@/components/ui/SoundToggle';
import {
  ANDROID_REQUIREMENT,
  APK_DOWNLOAD_URL,
  APK_ARCHITECTURE,
  APK_SIZE_LABEL,
  APK_UPDATED,
  APP_NAME,
  APP_STORE_URL,
  APP_VERSION,
  IOS_AVAILABLE,
} from '@/config/site';
import { GAME_COUNT } from '@/data/games';

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
}

export default function DownloadPanel() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const { play } = useSound();

  /**
   * Confirms the package is really there before opening the dialog.
   *
   * A download link that 404s after someone has read five steps and agreed to
   * a security warning is a far worse experience than an honest message up
   * front — and this is the one thing on the site that is expected to be
   * swapped out between releases.
   */
  const openDialog = async () => {
    play('swoosh');
    try {
      const response = await fetch(APK_DOWNLOAD_URL, { method: 'HEAD' });
      if (!response.ok) {
        setUnavailable(true);
        return;
      }
    } catch {
      // Offline, or the check was blocked. Let them try the download
      // anyway rather than blocking on a check that may itself be wrong.
    }
    setUnavailable(false);
    setDialogOpen(true);
  };

  const facts: Array<[string, string]> = [
    ['Version', APP_VERSION],
    ['Format', `Android APK · ${APK_ARCHITECTURE}`],
    ['Size', APK_SIZE_LABEL],
    ['Requires', ANDROID_REQUIREMENT],
    ['Updated', formatDate(APK_UPDATED)],
    ['Price', 'Free · no ads, no purchases'],
  ];

  return (
    <div className="relative">
      <div className="panel panel-sheen relative overflow-hidden p-7 sm:p-10">
        {/* One soft light source, behind the primary action. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,232,245,0.18),transparent)]"
        />

        <div className="relative text-center">
          <p className="eyebrow mb-3">Free download</p>
          <h3 className="display text-[clamp(1.5rem,3.4vw,2.2rem)] text-ink">
            {APP_NAME}
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-dim">
            {GAME_COUNT} games in one app. Plays offline, with no account,
            no adverts and no tracking.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <MagneticButton
              onClick={openDialog}
              ariaLabel={`Download ${APP_NAME} for Android, version ${APP_VERSION}`}
              className="glow-cyan w-full max-w-sm rounded-xl bg-cyan px-8 py-4 font-display text-base font-bold tracking-widest text-deep hover:brightness-110 active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  d="M9 2v10m0 0l-4-4m4 4l4-4M3 15h12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              DOWNLOAD FOR ANDROID
            </MagneticButton>

            {/* The iOS build exists in the app project but has not shipped,
                so this stays honest until APP_STORE_URL is set. */}
            {IOS_AVAILABLE && APP_STORE_URL ? (
              <MagneticButton
                href={APP_STORE_URL}
                className="w-full max-w-sm rounded-xl border border-[var(--edge-strong)] px-8 py-4 font-display text-sm font-bold tracking-widest text-ink hover:bg-white/5"
              >
                GET ON IOS
              </MagneticButton>
            ) : (
              <div
                className="w-full max-w-sm cursor-not-allowed rounded-xl border border-[var(--edge)] px-8 py-4 text-center font-display text-sm font-bold tracking-widest text-ink-ghost"
                aria-disabled="true"
              >
                GET ON IOS
                <span className="ml-2 font-body text-xs font-medium normal-case tracking-normal text-ink-faint">
                  — coming soon
                </span>
              </div>
            )}
          </div>

          {unavailable && (
            <p
              role="alert"
              className="mx-auto mt-5 max-w-sm rounded-lg border border-amber/30 bg-amber/10 p-4 text-sm leading-relaxed text-amber"
            >
              The download is temporarily unavailable. Please try again
              shortly, or{' '}
              <a href="#about" className="underline underline-offset-4">
                get in touch
              </a>{' '}
              if it keeps happening.
            </p>
          )}

          {started && (
            <p
              role="status"
              className="mt-5 text-sm text-mint"
            >
              Download started. Check your browser&rsquo;s downloads if you don&rsquo;t see it.
            </p>
          )}
        </div>

        <dl className="relative mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--edge)] pt-7 sm:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow !text-[0.58rem] !tracking-[0.22em]">{label}</dt>
              <dd className="mt-1.5 text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <InstallDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={() => {
          play('confirm');
          setStarted(true);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
