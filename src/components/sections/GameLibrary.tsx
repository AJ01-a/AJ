'use client';

import { useMemo, useState } from 'react';

import Section from '@/components/ui/Section';
import { useSound } from '@/components/ui/SoundToggle';
import {
  CATEGORIES,
  GAMES,
  GAME_COUNT,
  type CategoryId,
} from '@/data/games';

const ACCENT: Record<string, string> = {
  magenta: 'var(--color-magenta)',
  violet: 'var(--color-violet)',
  cyan: 'var(--color-cyan)',
  lime: 'var(--color-lime)',
  amber: 'var(--color-amber)',
  azure: 'var(--color-azure)',
  mint: 'var(--color-mint)',
};

type Filter = CategoryId | 'all';

/**
 * The complete library, filterable by category.
 *
 * The page claims fifty games; this is where that claim becomes something a
 * visitor can check rather than take on trust. Every entry is generated from
 * the app's own catalog, so the list cannot drift from what ships.
 *
 * Filtering is done by toggling a class rather than unmounting cards: the
 * DOM is only fifty nodes, and keeping them mounted means no layout thrash
 * and nothing for a screen reader to lose its place in.
 */
export default function GameLibrary() {
  const [filter, setFilter] = useState<Filter>('all');
  const { play } = useSound();

  const accentFor = useMemo(
    () => (id: CategoryId) =>
      ACCENT[CATEGORIES.find((c) => c.id === id)?.accent ?? 'cyan'],
    [],
  );

  const visibleCount =
    filter === 'all'
      ? GAME_COUNT
      : GAMES.filter((g) => g.category === filter).length;

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: GAME_COUNT },
    ...CATEGORIES.map((c) => ({
      id: c.id as Filter,
      label: c.label.replace(' Games', ''),
      count: c.count,
    })),
  ];

  return (
    <Section
      id="library"
      eyebrow="The full list"
      title={`Every one of the ${GAME_COUNT}`}
      lead="Nothing here is coming soon or planned. This is the shipped library, generated from the app's own catalog."
    >
      {/* Filters */}
      <div
        role="group"
        aria-label="Filter games by category"
        className="flex flex-wrap gap-2"
      >
        {filters.map((entry) => {
          const active = filter === entry.id;
          const accent =
            entry.id === 'all'
              ? 'var(--color-cyan)'
              : accentFor(entry.id as CategoryId);
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                play('tap');
                setFilter(entry.id);
              }}
              className="rounded-lg border px-3.5 py-2 font-display text-xs font-bold tracking-widest transition-colors duration-200"
              style={{
                color: active ? 'var(--color-deep)' : accent,
                background: active
                  ? accent
                  : `color-mix(in oklab, ${accent} 10%, transparent)`,
                borderColor: `color-mix(in oklab, ${accent} ${active ? 100 : 30}%, transparent)`,
              }}
            >
              {entry.label.toUpperCase()}
              <span className="ml-2 opacity-60">{entry.count}</span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-5 text-sm text-ink-faint">
        Showing {visibleCount} {visibleCount === 1 ? 'game' : 'games'}
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const hidden = filter !== 'all' && game.category !== filter;
          const accent = accentFor(game.category);
          return (
            <li
              key={game.id}
              // Hidden rather than unmounted, and hidden from assistive tech
              // too, so the filter does not lie to a screen reader.
              hidden={hidden}
              className={hidden ? 'hidden' : ''}
            >
              <article
                className="group h-full rounded-xl border border-[var(--edge)] bg-base p-5 transition-colors duration-300 hover:bg-raised"
                style={{ borderLeft: `2px solid color-mix(in oklab, ${accent} 55%, transparent)` }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="display text-sm leading-tight text-ink">
                    {game.name}
                  </h3>
                  <span className="shrink-0 font-body text-[0.7rem] text-ink-ghost">
                    {game.session}
                  </span>
                </div>
                <p
                  className="mt-1.5 text-xs leading-relaxed"
                  style={{ color: accent }}
                >
                  {game.tagline}
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
