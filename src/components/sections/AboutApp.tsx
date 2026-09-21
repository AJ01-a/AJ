import Section from '@/components/ui/Section';
import { APP_NAME, APP_VERSION } from '@/config/site';
import { CATEGORIES, GAME_COUNT } from '@/data/games';

export default function AboutApp() {
  const stats: Array<[string, string]> = [
    [String(GAME_COUNT), 'games'],
    [String(CATEGORIES.length), 'categories'],
    ['4', 'difficulty tiers'],
    ['0', 'adverts'],
  ];

  return (
    <Section
      id="about-app"
      eyebrow={`What is ${APP_NAME}?`}
      title="Fifty games. One app. No connection required."
      lead={
        <>
          A collection of fast, replayable arcade, puzzle, math, memory,
          reaction and word games, built so that opening the app and playing
          something takes two taps — or one, if you use the
          {' '}<span className="text-ink">I&rsquo;m Bored</span> button.
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div className="space-y-5 text-base leading-relaxed text-ink-dim">
          <p>
            Every game keeps its own high score per difficulty, and the app
            tracks a level, a daily streak and {37} achievements across
            everything you play. A daily challenge picks one game and one goal,
            and changes at midnight.
          </p>
          <p>
            It was built to be opened for ninety seconds in a queue as easily
            as for half an hour on a sofa. Nothing is gated behind a purchase,
            because there are no purchases.
          </p>
          <p className="text-ink-faint">
            These are games for entertainment and practice. They make no
            medical or cognitive claims.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-4 self-start">
          {stats.map(([value, label]) => (
            <li
              key={label}
              className="panel panel-sheen px-5 py-6 text-center"
            >
              <p className="display text-gradient text-3xl sm:text-4xl">{value}</p>
              <p className="mt-1.5 font-body text-xs tracking-wide text-ink-faint">
                {label}
              </p>
            </li>
          ))}
          <li className="panel col-span-2 px-5 py-4 text-center">
            <p className="font-body text-xs text-ink-faint">
              Current release
              <span className="ml-2 font-display font-bold text-ink">
                v{APP_VERSION}
              </span>
            </p>
          </li>
        </ul>
      </div>
    </Section>
  );
}
