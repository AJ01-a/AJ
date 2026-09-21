import type { Metadata } from 'next';

import LegalPage from '@/components/legal/LegalPage';
import {
  APP_NAME,
  SUPPORT_URL,
  SUPPORT_LABEL,
} from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${APP_NAME} and this website handle your data — which is to say, they do not collect it.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="20 September 2026"
      intro={
        <>
          <strong className="text-ink">The short version:</strong> this website
          sets no cookies and runs no analytics, and the app keeps everything on
          your device and sends nothing anywhere.
        </>
      }
    >
      <p>
        This policy covers two separate things: this website, and the{' '}
        {APP_NAME} Android application you can download from it. They are
        described separately below because they behave differently.
      </p>

      <h2>This website</h2>

      <h3>What it collects</h3>
      <p>
        Nothing. This site is a set of static pages. It does not use cookies,
        local storage, analytics, tracking pixels, advertising networks,
        fingerprinting, session recording or embedded third-party widgets.
        There are no forms and no accounts.
      </p>

      <h3>What your browser sends anyway</h3>
      <p>
        Any web server necessarily receives a request in order to send a page
        back. This site is hosted on{' '}
        <a href="https://pages.github.com/">GitHub Pages</a>, so those requests
        are handled by GitHub rather than by the site owner. GitHub&rsquo;s
        documentation states that{' '}
        <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages">
          a visitor&rsquo;s IP address is logged and stored for security
          purposes
        </a>{' '}
        whenever a Pages site is visited. How long GitHub keeps it, and what
        else they collect, is governed by the{' '}
        <a href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement">
          GitHub Privacy Statement
        </a>
        , not by this one.
      </p>
      <p>
        Those logs are not available to the site owner. No analytics, tag
        manager or other third-party script runs on this site, so nothing
        beyond that server-side logging is collected, and nothing is used to
        profile you.
      </p>

      <h3>Fonts and assets</h3>
      <p>
        The two typefaces used here are bundled with the site and served from
        the same domain. No request is made to Google Fonts or any other
        third-party font service, so no data reaches one.
      </p>

      <h2>The {APP_NAME} app</h2>

      <h3>What the app stores</h3>
      <p>On your device only:</p>
      <ul>
        <li>A display name, if you set one.</li>
        <li>High scores, statistics and play counts for each game.</li>
        <li>Your level, experience points and streaks.</li>
        <li>Which achievements you have unlocked.</li>
        <li>Favourites and recently played games.</li>
        <li>Daily challenge progress.</li>
        <li>Settings: sound, music, haptics, theme and motion preferences.</li>
      </ul>
      <p>
        This is kept in the app&rsquo;s own storage. It is removed if you
        uninstall the app, and it can be cleared at any time from the
        app&rsquo;s Settings screen.
      </p>

      <h3>What the app does not do</h3>
      <ul>
        <li>No account is required and none is offered.</li>
        <li>No personal information is requested.</li>
        <li>No advertising, and no advertising identifiers.</li>
        <li>No analytics, telemetry or crash reporting.</li>
        <li>No data is transmitted off the device.</li>
      </ul>

      <h3>Permissions</h3>
      <p>
        The app requests no runtime permissions. It does not use the camera,
        microphone, location, contacts, storage, SMS or call logs, and it has
        no network access at all — it does not hold the Android{' '}
        <code>INTERNET</code> permission, so it is technically incapable of
        sending anything anywhere.
      </p>

      <h2>Children</h2>
      <p>
        The app is designed to be broadly family-friendly, but it is not
        directed at children under 13 and is not listed in any store&rsquo;s
        dedicated children&rsquo;s category.
      </p>

      <h2>Changes</h2>
      <p>
        If a future version of the website or the app adds anything that
        collects or transmits data, this page will be updated before that
        version is released, along with the in-app privacy notice and the
        relevant app store disclosures.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be raised on{' '}
        <a href={SUPPORT_URL}>{SUPPORT_LABEL}</a>. Note that issues there are
        public, so please do not include anything you would not want others to
        read.
      </p>

      <div className="callout">
        <strong>This is a template, not legal advice.</strong> It describes the
        site and app as built, but it has not been reviewed by a lawyer. Before
        publishing, confirm it meets the requirements that apply where you
        operate and where your visitors are — GDPR, UK GDPR, CCPA and others
        impose obligations this document does not attempt to cover.
      </div>
    </LegalPage>
  );
}
