import Section from '@/components/ui/Section';
import { GAME_COUNT } from '@/data/games';

/**
 * Feature list.
 *
 * Every claim here is true of the shipped build — no cloud sync, no
 * leaderboards, no multiplayer, because none of those exist.
 */
const REASONS = [
  {
    title: 'Two taps to playing',
    body:
      'The dashboard launches any game in two taps. The I’m Bored button picks one and starts it in one.',
  },
  {
    title: 'Works with no connection',
    body:
      'Every game, score and achievement works offline. The app requests no permissions and has no network access at all.',
  },
  {
    title: `${GAME_COUNT} games, seven kinds`,
    body:
      'Arcade, puzzle, math, memory, reaction, word and logic — so a session can be reflexes or deduction, whichever you are in the mood for.',
  },
  {
    title: 'Four difficulties everywhere',
    body:
      'Easy through Expert on every game, with scores weighted so a hard run outranks an easy one on the same board.',
  },
  {
    title: 'Scores that stay yours',
    body:
      'High scores, statistics, levels and streaks are saved on your device. No account, and nothing uploaded anywhere.',
  },
  {
    title: 'A reason to come back',
    body:
      'A daily challenge that rolls over at midnight, 37 achievements with real progress, and a streak that rewards short, regular sessions.',
  },
] as const;

export default function WhySection() {
  return (
    <Section
      id="why"
      eyebrow="Why this one"
      title="Built for the gap between things"
      lead="Short sessions, no friction, and nothing asking you for money or an email address."
    >
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-[var(--edge)] bg-[var(--edge)] sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((reason, index) => (
          <li
            key={reason.title}
            className="group relative bg-base p-7 transition-colors duration-300 hover:bg-raised"
          >
            <span className="font-display text-xs font-bold tracking-widest text-ink-ghost">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="display mt-4 text-base leading-snug text-ink">
              {reason.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-dim">
              {reason.body}
            </p>
            {/* Accent edge on hover — one line, no colour wash. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-cyan to-magenta transition-transform duration-500 ease-out group-hover:scale-x-100"
            />
          </li>
        ))}
      </ul>
    </Section>
  );
}
