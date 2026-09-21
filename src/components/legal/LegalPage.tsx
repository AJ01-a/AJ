import Link from 'next/link';
import type { ReactNode } from 'react';

import SiteFooter from '@/components/sections/SiteFooter';

interface LegalPageProps {
  title: string;
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}

/**
 * Shared chrome for the legal pages.
 *
 * These are plain, high-contrast documents on purpose. Nobody should have to
 * fight a cinematic background to read a privacy policy.
 */
export default function LegalPage({
  title,
  updated,
  intro,
  children,
}: LegalPageProps) {
  return (
    <>
      <div className="min-h-screen bg-void">
        <header className="border-b border-[var(--edge)]">
          <div className="shell flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-sm font-extrabold tracking-[0.18em] text-ink"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md border border-cyan/40 bg-cyan/10 text-[0.65rem] text-cyan">
                AJ
              </span>
              RETROMIND ARCADE
            </Link>
            <Link
              href="/#download"
              className="rounded-lg border border-[var(--edge-strong)] px-4 py-2 font-display text-xs font-bold tracking-widest text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
            >
              DOWNLOAD
            </Link>
          </div>
        </header>

        <main className="shell max-w-3xl py-16 sm:py-24">
          <p className="eyebrow">Legal</p>
          <h1 className="display mt-3 text-[clamp(1.9rem,5vw,3rem)] text-ink">
            {title}
          </h1>
          <p className="mt-3 text-sm text-ink-faint">Last updated {updated}</p>

          {intro && (
            <div className="mt-8 rounded-xl border border-cyan/25 bg-cyan/[0.06] p-5 text-sm leading-relaxed text-ink-dim">
              {intro}
            </div>
          )}

          <div className="legal-body mt-10">{children}</div>

          <div className="hairline my-12" />
          <Link
            href="/"
            className="font-display text-sm font-bold tracking-widest text-cyan underline-offset-4 hover:underline"
          >
            ← BACK TO SITE
          </Link>
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
