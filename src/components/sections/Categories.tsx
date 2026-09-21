import Section from '@/components/ui/Section';
import TiltCard from '@/components/ui/TiltCard';
import { CATEGORIES, GAME_COUNT, type CategoryId } from '@/data/games';

/**
 * Category glyphs, drawn as inline SVG.
 *
 * Inline rather than an icon font or sprite: seven small paths cost less than
 * a request, scale cleanly, and inherit `currentColor` so each card can tint
 * its own.
 */
const GLYPHS: Record<CategoryId, React.ReactNode> = {
  arcade: (
    <>
      <rect x="2" y="7" width="20" height="11" rx="3.5" />
      <path d="M7 11v3M5.5 12.5h3M15.5 12.5h.01M18 11h.01" />
    </>
  ),
  puzzle: (
    <path d="M10 3h4v3a2 2 0 104 0V9h3v4h-3a2 2 0 100 4h3v4h-4v-3a2 2 0 10-4 0v3H6v-4H3V9h3V6h4V3z" />
  ),
  math: (
    <>
      <path d="M4 7h6M7 4v6M14 6h6M14 17h6M14 14l6 6M14 20l6-6M4 16h6" />
    </>
  ),
  memory: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  reaction: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
  word: (
    <>
      <path d="M3 18l5-12 5 12M4.8 14h6.4" />
      <path d="M16 10h3a2.5 2.5 0 010 5h-3zM16 15h3.5a2.5 2.5 0 010 5H16z" />
    </>
  ),
  logic: (
    <>
      <circle cx="12" cy="6" r="2.6" />
      <circle cx="5.5" cy="17" r="2.6" />
      <circle cx="18.5" cy="17" r="2.6" />
      <path d="M12 8.6v6M10 15.4l-2.4 0.8M14 15.4l2.4 0.8" />
    </>
  ),
};

const ACCENT_VAR: Record<string, string> = {
  magenta: 'var(--color-magenta)',
  violet: 'var(--color-violet)',
  cyan: 'var(--color-cyan)',
  lime: 'var(--color-lime)',
  amber: 'var(--color-amber)',
  azure: 'var(--color-azure)',
  mint: 'var(--color-mint)',
};

export default function Categories() {
  return (
    <Section
      id="categories"
      eyebrow="Seven shelves"
      title="Something for whatever kind of bored you are"
      lead={
        <>
          All {GAME_COUNT} games are grouped into seven categories, so the app
          has something for a thirty-second gap and something for a long wait.
        </>
      }
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const accent = ACCENT_VAR[category.accent] ?? 'var(--color-cyan)';
          return (
            <li key={category.id}>
              <TiltCard accent={accent} className="group h-full">
                <article
                  className="panel panel-sheen flex h-full flex-col p-6 transition-colors duration-300"
                  style={{
                    borderColor: 'var(--edge)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-xl"
                      style={{
                        color: accent,
                        background: `color-mix(in oklab, ${accent} 14%, transparent)`,
                        border: `1px solid color-mix(in oklab, ${accent} 34%, transparent)`,
                      }}
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {GLYPHS[category.id]}
                      </svg>
                    </span>
                    <span
                      className="font-display text-xs font-bold tracking-widest"
                      style={{ color: accent }}
                    >
                      {category.count} GAMES
                    </span>
                  </div>

                  <h3 className="display mt-5 text-lg text-ink">{category.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                    {category.blurb}
                  </p>
                </article>
              </TiltCard>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
