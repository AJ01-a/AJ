'use client';

import { useRef, useState } from 'react';

import Section from '@/components/ui/Section';
import TiltCard from '@/components/ui/TiltCard';
import { CATEGORIES, FEATURED_GAMES, GAME_COUNT } from '@/data/games';

const ACCENT: Record<string, string> = {
  magenta: 'var(--color-magenta)',
  violet: 'var(--color-violet)',
  cyan: 'var(--color-cyan)',
  lime: 'var(--color-lime)',
  amber: 'var(--color-amber)',
  azure: 'var(--color-azure)',
  mint: 'var(--color-mint)',
};

function accentFor(categoryId: string): string {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return ACCENT[category?.accent ?? 'cyan'] ?? 'var(--color-cyan)';
}

function labelFor(categoryId: string): string {
  return CATEGORIES.find((c) => c.id === categoryId)?.label ?? '';
}

/**
 * Horizontal showcase of real games from the app.
 *
 * Native scroll with snap points rather than a JS carousel: it gets touch
 * momentum, keyboard scrolling, screen-reader order and reduced-motion
 * behaviour for free, and ships no slider library.
 */
export default function GameCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  const nudge = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <Section
      id="games"
      eyebrow="From the library"
      title="A few of the fifty"
      lead={
        <>
          Every game listed here ships in the app. There are {GAME_COUNT} in
          total — these are a cross-section.
        </>
      }
    >
      <div className="relative">
        <div className="mb-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            disabled={atStart}
            aria-label="Scroll games left"
            className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--edge-strong)] text-ink-dim transition-colors hover:bg-white/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            disabled={atEnd}
            aria-label="Scroll games right"
            className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--edge-strong)] text-ink-dim transition-colors hover:bg-white/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <ul
          ref={trackRef}
          onScroll={updateEdges}
          // `tabIndex` makes the overflow region focusable so it can be
          // scrolled with the arrow keys, which is what keyboard users expect
          // of a horizontal strip.
          tabIndex={0}
          aria-label="Featured games"
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FEATURED_GAMES.map((game) => {
            const accent = accentFor(game.category);
            return (
              <li
                key={game.id}
                className="w-[17rem] shrink-0 snap-start sm:w-[19rem]"
              >
                <TiltCard accent={accent} className="group h-full">
                  <article className="panel panel-sheen flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="rounded-md px-2 py-1 font-display text-[0.6rem] font-bold tracking-widest"
                        style={{
                          color: accent,
                          background: `color-mix(in oklab, ${accent} 13%, transparent)`,
                          border: `1px solid color-mix(in oklab, ${accent} 32%, transparent)`,
                        }}
                      >
                        {labelFor(game.category).toUpperCase()}
                      </span>
                      <span className="shrink-0 font-body text-xs text-ink-faint">
                        {game.session}
                      </span>
                    </div>

                    <h3 className="display mt-5 text-lg leading-tight text-ink">
                      {game.name}
                    </h3>
                    <p className="mt-1.5 text-sm" style={{ color: accent }}>
                      {game.tagline}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-dim">
                      {game.description.length > 155
                        ? `${game.description.slice(0, 152).trimEnd()}…`
                        : game.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-1.5 border-t border-[var(--edge)] pt-4">
                      {game.difficulties.map((difficulty) => (
                        <span
                          key={difficulty}
                          className="rounded border border-[var(--edge)] px-1.5 py-0.5 font-body text-[0.68rem] text-ink-faint"
                        >
                          {difficulty}
                        </span>
                      ))}
                    </div>
                  </article>
                </TiltCard>
              </li>
            );
          })}
        </ul>

        {/* Fade the right edge so the strip reads as continuing. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-px bottom-4 top-14 w-16 bg-gradient-to-l from-void to-transparent"
        />
      </div>
    </Section>
  );
}
