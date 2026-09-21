import Section from '@/components/ui/Section';
import { INSTALL_STEPS } from '@/data/install-steps';

/**
 * A permanent copy of the install instructions.
 *
 * The same steps appear in the pre-download dialog, but someone who has
 * already downloaded the file and hit a warning needs to be able to find
 * them again without starting another download.
 */
export default function InstallGuide() {
  return (
    <Section
      id="install"
      eyebrow="Installing"
      title="How to install the APK"
      lead="The same steps shown before the download, kept here so you can find them again afterwards."
    >
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INSTALL_STEPS.map((step, index) => (
          <li key={step.title} className="panel panel-sheen p-6">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-violet/40 bg-violet/10 font-display text-xs font-bold text-violet">
              {index + 1}
            </span>
            <h3 className="display mt-4 text-base text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-dim">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-xl border border-amber/25 bg-amber/[0.07] p-6">
        <h3 className="display text-sm tracking-wide text-amber">
          Why Android warns you
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-dim">
          Android shows a warning for any app installed outside the Play Store,
          regardless of what the app does. It is telling you that it has not
          vetted the file — not that this file is unsafe. Only install APKs from
          sources you trust, and leave your device&rsquo;s security protections
          switched on.
        </p>
      </div>
    </Section>
  );
}
