import Link from 'next/link';

import { SUPPORT_EMAIL } from '@/config/site';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="scanlines relative grid min-h-[100svh] place-items-center overflow-hidden bg-void px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,#141a33_0%,#04060f_70%)]" />
      <div className="grid-floor absolute inset-0 opacity-40" />

      <div className="relative max-w-lg text-center">
        <p className="eyebrow">Signal lost</p>
        <p
          className="display mt-4 text-[clamp(4rem,18vmin,9rem)] leading-none text-ink"
          style={{ textShadow: '0 0 60px rgba(255,61,174,0.3)' }}
        >
          404
        </p>
        <h1 className="display mt-4 text-xl text-ink">
          This page does not exist
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          The address may be mistyped, or the page may have moved. Everything
          on this site is reachable from the home page.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="glow-cyan rounded-lg bg-cyan px-6 py-3 font-display text-sm font-bold tracking-widest text-deep"
          >
            BACK TO HOME
          </Link>
          <Link
            href="/#download"
            className="rounded-lg border border-[var(--edge-strong)] px-6 py-3 font-display text-sm font-bold tracking-widest text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
          >
            DOWNLOAD THE APP
          </Link>
        </div>

        <p className="mt-8 text-xs text-ink-ghost">
          Still stuck?{' '}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-cyan underline-offset-4 hover:underline"
          >
            Get in touch
          </a>
          .
        </p>
      </div>
    </main>
  );
}
