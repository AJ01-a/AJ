import type { Metadata } from 'next';

import LegalPage from '@/components/legal/LegalPage';
import { APP_NAME, CREATOR_NAME, SUPPORT_EMAIL } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `The terms covering use of the ${APP_NAME} website and application.`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="20 September 2026">
      <p>
        These terms cover your use of this website and of the {APP_NAME}{' '}
        application. By downloading or using the app, you accept them.
      </p>

      <h2>Licence</h2>
      <p>
        You may install and use {APP_NAME} on devices you own or control, for
        personal, non-commercial entertainment. You may not sell, rent,
        redistribute, repackage or republish the app or its assets, or attempt
        to reverse engineer it except where that right cannot be excluded by
        law.
      </p>

      <h2>The download</h2>
      <p>
        The Android package offered here installs outside the Google Play
        Store. Android will warn you about that, as it does for any app
        installed from outside the store. You are responsible for deciding
        whether to allow the installation on your device.
      </p>
      <p>
        Only install APK files from sources you trust, and keep your
        device&rsquo;s security protections enabled. If you obtained a file
        claiming to be {APP_NAME} from anywhere other than this site, it is not
        covered by these terms and its contents are unknown to us.
      </p>

      <h2>Entertainment, not medical advice</h2>
      <p>
        The puzzle, memory, arithmetic and reaction games in this app are
        entertainment and practice activities. They are <strong>not</strong> a
        medical device, a diagnostic tool, a treatment or a therapy.
      </p>
      <p>
        This app does not claim to increase intelligence, improve memory,
        prevent or slow cognitive decline, or treat, diagnose or manage any
        medical or psychological condition. Nothing in the app or on this site
        is medical or professional advice. If you have concerns about your
        health or cognition, speak to a qualified professional.
      </p>

      <h2>Your data</h2>
      <p>
        The app stores your progress on your device and does not back it up
        anywhere. If you uninstall the app, clear its data, or reset your
        statistics from the Settings screen, that progress is gone and cannot
        be recovered.
      </p>

      <h2>Availability and changes</h2>
      <p>
        The website and the app are provided as-is. Features may change between
        versions. There is no guarantee that either will be free of defects, or
        that any particular game will remain in a future version.
      </p>

      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, the website and the app are
        provided without warranties of any kind, and {CREATOR_NAME} is not
        liable for any loss arising from their use. Some jurisdictions do not
        allow certain limitations, in which case those limitations apply only
        as far as the law permits. Nothing here affects rights you have as a
        consumer that cannot be waived.
      </p>

      <h2>Intellectual property</h2>
      <p>
        {APP_NAME}, its name, artwork, audio and code are the property of{' '}
        {CREATOR_NAME}. Several games belong to long-established genres, but
        each is an original implementation with its own name, rules,
        presentation and assets. See the{' '}
        <a href="/licenses">Licenses</a> page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <div className="callout">
        <strong>To be completed before publication.</strong> This template does
        not state a governing law or jurisdiction, does not name a legal
        entity, and has not been reviewed by a lawyer. Add the country or state
        whose law applies, identify the contracting party, and check the
        consumer-rights wording for every market you publish in.
      </div>
    </LegalPage>
  );
}
