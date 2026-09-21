'use client';

import { useEffect, useState } from 'react';

const LINES = [
  'INITIALISING',
  'LOADING RETROMIND',
  'SYSTEM READY',
] as const;

/**
 * Brief system-boot overlay.
 *
 * Deliberately short and self-cancelling: if the page is already interactive
 * there is nothing to wait for, and a fake progress bar would just be a
 * delay dressed up as polish. It also bails out immediately for
 * reduced-motion users and for anyone arriving at a deep link.
 */
export default function Preloader() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Arriving at an anchor means the visitor wants a section, not a show.
    const deepLink = window.location.hash.length > 1;

    if (reduced || deepLink) {
      // Scheduled rather than set synchronously: a state write during the
      // effect body forces a second render pass before the browser paints.
      const skip = window.setTimeout(() => setDone(true), 0);
      return () => window.clearTimeout(skip);
    }

    // Lock scrolling for the short duration, so the hero is not half-scrolled
    // when it appears.
    document.body.style.overflow = 'hidden';

    const timers = [
      window.setTimeout(() => setStep(1), 260),
      window.setTimeout(() => setStep(2), 620),
      window.setTimeout(() => {
        setDone(true);
        document.body.style.overflow = '';
      }, 1000),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      // Read by scripts/verify.mjs. Until this overlay is done it covers the
      // page, so a click lands on it instead of the button underneath and
      // the test fails for a reason that has nothing to do with the site.
      // Waiting on a fixed delay made that failure intermittent; waiting on
      // this makes it deterministic.
      data-preloader={done ? 'done' : 'running'}
      className={`fixed inset-0 z-[100] grid place-items-center bg-void transition-opacity duration-700 ease-out ${
        done ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-xs px-8 text-center">
        <p className="eyebrow !tracking-[0.4em] text-cyan">{LINES[step]}</p>
        <div className="mt-5 h-px w-full overflow-hidden bg-[var(--edge)]">
          <div
            className="h-full origin-left bg-gradient-to-r from-cyan to-magenta transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${(step + 1) / LINES.length})` }}
          />
        </div>
      </div>
    </div>
  );
}
