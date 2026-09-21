'use client';

import { useCallback, useEffect, useRef } from 'react';

import { INSTALL_STEPS } from '@/data/install-steps';
import {
  APK_DOWNLOAD_URL,
  APK_FILE_NAME,
  APP_NAME,
  APP_VERSION,
} from '@/config/site';

interface InstallDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * The pre-download explainer.
 *
 * Sideloading deserves an honest interstitial: people are about to be shown a
 * security warning by their own operating system, and a download that fires
 * without warning is exactly the pattern that makes APKs feel untrustworthy.
 *
 * Implemented with the native `<dialog>` element, which gives focus trapping,
 * Escape-to-close, inertness of the page behind and the correct accessibility
 * role without reimplementing any of it.
 */
export default function InstallDialog({ open, onClose, onConfirm }: InstallDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // Land focus on the explanation rather than the download button, so
      // nobody confirms by reflex before reading it.
      requestAnimationFrame(() => confirmRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // `close` fires for Escape and for the backdrop, so state stays in sync
  // however the dialog was dismissed.
  const handleClose = useCallback(() => onClose(), [onClose]);

  // Clicking the backdrop (outside the panel) dismisses.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleClick}
      aria-labelledby="install-title"
      aria-describedby="install-intro"
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-2xl bg-transparent p-0 text-ink backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="panel panel-sheen max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">{APP_NAME} · v{APP_VERSION}</p>
            <h2 id="install-title" className="display text-2xl text-ink">
              Before you install
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-lg p-2 text-ink-faint transition-colors hover:bg-white/5 hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p id="install-intro" className="mt-4 text-sm leading-relaxed text-ink-dim">
          This APK installs directly, outside the Google Play Store. That is
          normal for a direct download, but Android will warn you about it.
          Here is what to expect.
        </p>

        <ol className="mt-6 space-y-4">
          {INSTALL_STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-cyan/40 bg-cyan/10 font-display text-xs font-bold text-cyan"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold tracking-wide text-ink">
                  {step.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-dim">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-lg border border-amber/30 bg-amber/10 p-4 text-sm leading-relaxed text-amber">
          <strong className="font-semibold">Stay careful.</strong> Only install APK
          files from sources you trust, and keep your device&rsquo;s security
          protections turned on.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--edge-strong)] px-5 py-3 font-display text-sm font-bold tracking-widest text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
          >
            CANCEL
          </button>
          <a
            ref={confirmRef}
            href={APK_DOWNLOAD_URL}
            download={APK_FILE_NAME}
            onClick={onConfirm}
            className="glow-cyan rounded-lg bg-cyan px-6 py-3 text-center font-display text-sm font-bold tracking-widest text-deep transition-transform hover:scale-[1.02] active:scale-95"
          >
            DOWNLOAD APK
          </a>
        </div>
      </div>
    </dialog>
  );
}
