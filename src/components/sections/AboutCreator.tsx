import Section from '@/components/ui/Section';
import {
  APP_NAME,
  APP_VERSION,
  BUILT_WITH,
  CREATOR_NAME,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_IS_PLACEHOLDER,
} from '@/config/site';

export default function AboutCreator() {
  return (
    <Section id="about" eyebrow="About" title="Who made this">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="panel panel-sheen p-8">
          <p className="eyebrow">Created by</p>
          <p className="display mt-2 text-2xl text-ink">{CREATOR_NAME}</p>

          <p className="eyebrow mt-7">Built with</p>
          <p className="display mt-2 text-2xl text-ink">{BUILT_WITH}</p>

          <p className="mt-7 text-sm leading-relaxed text-ink-dim">
            {APP_NAME} is an independent project. Every game, sound effect,
            music track and piece of artwork in it was made for the app —
            nothing is licensed from or copied out of another game.
          </p>
        </div>

        <div className="panel p-8">
          <h3 className="display text-base text-ink">Support</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            Found a bug, or something not working on your device? Get in touch.
          </p>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-block break-all font-display text-sm font-bold tracking-wide text-cyan underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>

          {SUPPORT_EMAIL_IS_PLACEHOLDER && (
            /* Visible on purpose: a fake-looking placeholder is far safer
               than a plausible address that silently goes nowhere. */
            <p className="mt-3 rounded-lg border border-amber/30 bg-amber/10 p-3 text-xs leading-relaxed text-amber">
              Placeholder address. Set <code>SUPPORT_EMAIL</code> in{' '}
              <code>src/config/site.ts</code> before publishing.
            </p>
          )}

          <dl className="mt-8 space-y-3 border-t border-[var(--edge)] pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">App version</dt>
              <dd className="font-display font-bold text-ink">{APP_VERSION}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Platform</dt>
              <dd className="text-ink">Android · iOS in progress</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-faint">Price</dt>
              <dd className="text-ink">Free</dd>
            </div>
          </dl>
        </div>
      </div>
    </Section>
  );
}
