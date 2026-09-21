'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { SUPPORT_EMAIL } from '@/config/site';

/**
 * Last-resort boundary.
 *
 * Shows a plain apology and a route to the download rather than a stack
 * trace. The real error is logged to the console for anyone debugging, but is
 * never rendered — it can contain paths and internals a visitor has no use
 * for.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error on RetroMind Arcade site:', error);
  }, [error]);

  return (
    <main className="grid min-h-[100svh] place-items-center bg-void px-6">
      <div className="panel max-w-md p-8 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display mt-3 text-xl text-ink">
          This page failed to load
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          Reloading usually fixes it. If it keeps happening, the download is
          still available from the home page.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-cyan px-6 py-3 font-display text-sm font-bold tracking-widest text-deep"
          >
            TRY AGAIN
          </button>
          <Link
            href="/#download"
            className="rounded-lg border border-[var(--edge-strong)] px-6 py-3 font-display text-sm font-bold tracking-widest text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
          >
            GO TO DOWNLOAD
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 font-mono text-[0.7rem] text-ink-ghost">
            Reference: {error.digest}
          </p>
        )}

        <p className="mt-4 text-xs text-ink-ghost">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-cyan underline-offset-4 hover:underline"
          >
            Report this
          </a>
        </p>
      </div>
    </main>
  );
}
