'use client';

import { useEffect, useRef, useState } from 'react';

import SoundToggle, { useSound } from '@/components/ui/SoundToggle';
import { APP_NAME, NAV_LINKS } from '@/config/site';

/**
 * Top navigation.
 *
 * Deliberately absent during the opening sequence — a chrome bar over the
 * "AJ" moment would break the illusion of entering a system. It fades in once
 * the hero has been scrolled past.
 */
export default function SiteNav() {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { play } = useSound();

  useEffect(() => {
    const onScroll = () => {
      // The hero is 420vh, so its scrub finishes around 3.2 viewport
      // heights. Revealing the bar any earlier puts chrome over the
      // reassembly — the one moment the page is built around.
      setVisible(window.scrollY > window.innerHeight * 3.25);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 transition-[opacity,transform] duration-500 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-3 opacity-0'
      }`}
      // Hidden from assistive tech while it is visually hidden, so the tab
      // order does not include invisible controls.
      aria-hidden={!visible}
      // Keeps the hidden bar out of the tab order during the opening
      // sequence, without removing it from the DOM and re-mounting it.
      inert={!visible}
    >
      <div className="border-b border-[var(--edge)] bg-void/70 backdrop-blur-xl">
        <nav
          aria-label="Main"
          className="shell flex h-16 items-center justify-between gap-6"
        >
          <a
            href="#top"
            className="flex shrink-0 items-center gap-2.5 font-display text-sm font-extrabold tracking-[0.18em] text-ink"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md border border-cyan/40 bg-cyan/10 text-[0.65rem] text-cyan">
              AJ
            </span>
            <span className="hidden sm:inline">{APP_NAME.toUpperCase()}</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => play('tap')}
                  className="rounded-lg px-3.5 py-2 font-body text-sm text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <SoundToggle className="hidden sm:grid" />
            <a
              href="#download"
              onClick={() => play('confirm')}
              className="hidden rounded-lg bg-cyan px-4 py-2 font-display text-xs font-bold tracking-widest text-deep transition-transform hover:scale-[1.03] active:scale-95 sm:inline-block"
            >
              DOWNLOAD
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--edge-strong)] text-ink md:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                {menuOpen ? (
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <ul
            id="mobile-menu"
            className="shell grid gap-1 border-t border-[var(--edge)] py-3 md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 font-body text-sm text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
