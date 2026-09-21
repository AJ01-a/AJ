import Section from '@/components/ui/Section';
import { ANDROID_REQUIREMENT, APK_SIZE_LABEL, APP_NAME } from '@/config/site';
import { GAME_COUNT } from '@/data/games';

/**
 * Frequently asked questions.
 *
 * A direct download asks more of a visitor than a store listing does, and the
 * hesitations are predictable: is this safe, why is it not on Google Play,
 * what is Android warning me about. Answering those plainly — including
 * saying outright that the app is unsigned by Play and that the warning is
 * expected — does more for trust than any amount of styling.
 *
 * Built on <details>, so it works without JavaScript, is keyboard operable
 * and is announced correctly by screen readers.
 */
const FAQS = [
  {
    q: 'Is this safe to install?',
    a: `${APP_NAME} requests no permissions at all and has no network access — it does not hold Android's INTERNET permission, so it cannot send anything anywhere even if it wanted to. That said, you should apply the same caution to any APK: only install files from a source you trust, and keep your device's security protections switched on. If you would rather wait for a Play Store listing, that is a perfectly reasonable choice.`,
  },
  {
    q: 'Why is it not on the Google Play Store?',
    a: 'It is an independent release and has not been submitted to Play. A direct APK means it can be shared immediately, without a review queue or a developer account. A Play listing may follow.',
  },
  {
    q: 'Android says the file may be harmful. Should I worry?',
    a: 'Android shows that warning for every app installed outside the Play Store, whatever the app does. It means Android has not vetted the file — not that the file is known to be dangerous. You can allow the install for your browser, then turn that permission off again afterwards.',
  },
  {
    q: 'Will it work on my phone?',
    a: `It needs ${ANDROID_REQUIREMENT}. The download is built for 64-bit ARM devices, which covers effectively every Android phone sold in the last several years. It is about ${APK_SIZE_LABEL} installed.`,
  },
  {
    q: 'Does it need an internet connection?',
    a: `No. All ${GAME_COUNT} games, every score, the daily challenge and all achievements work with no connection. The app has no online features at all.`,
  },
  {
    q: 'Are there adverts or in-app purchases?',
    a: 'Neither. There is no advertising SDK, no purchase flow, no subscription and no "premium" tier. Every game is available from the moment you install it.',
  },
  {
    q: 'What happens to my scores and data?',
    a: 'Everything stays on your device — there is no account and nothing is uploaded. That also means progress is not backed up: uninstalling the app, clearing its data, or using the reset option in Settings will remove it permanently.',
  },
  {
    q: 'Is there an iPhone version?',
    a: 'The app is built with a cross-platform framework and the iOS project is configured, but it has not been submitted to the App Store yet. The iOS button above will become a working link when it is.',
  },
] as const;

export default function Faq() {
  return (
    <Section
      id="faq"
      eyebrow="Questions"
      title="Before you download"
      lead="The things worth knowing about installing an app this way."
    >
      <div className="mx-auto max-w-3xl divide-y divide-[var(--edge)] overflow-hidden rounded-2xl border border-[var(--edge)]">
        {FAQS.map((item) => (
          <details key={item.q} className="group bg-base open:bg-raised">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 transition-colors hover:bg-white/[0.03] sm:p-6 [&::-webkit-details-marker]:hidden">
              <h3 className="font-display text-sm font-bold leading-snug tracking-wide text-ink">
                {item.q}
              </h3>
              <span
                aria-hidden="true"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-[var(--edge-strong)] text-ink-faint transition-transform duration-300 group-open:rotate-45"
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path
                    d="M6 1v10M1 6h10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </summary>
            <p className="px-5 pb-6 text-sm leading-relaxed text-ink-dim sm:px-6">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
