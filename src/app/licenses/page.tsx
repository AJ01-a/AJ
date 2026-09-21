import type { Metadata } from 'next';

import LegalPage from '@/components/legal/LegalPage';
import { APP_NAME, CREATOR_NAME } from '@/config/site';

export const metadata: Metadata = {
  title: 'Licenses',
  description: `Open-source licences and asset attribution for ${APP_NAME} and this website.`,
};

const WEBSITE_DEPS = [
  ['Next.js', 'MIT', 'https://github.com/vercel/next.js'],
  ['React', 'MIT', 'https://github.com/facebook/react'],
  ['Tailwind CSS', 'MIT', 'https://github.com/tailwindlabs/tailwindcss'],
  ['GSAP', 'GreenSock Standard License', 'https://gsap.com/licensing/'],
  ['Three.js', 'MIT', 'https://github.com/mrdoob/three.js'],
] as const;

const APP_DEPS = [
  ['Flutter', 'BSD-3-Clause', 'https://github.com/flutter/flutter'],
  ['provider', 'MIT', 'https://pub.dev/packages/provider'],
  ['shared_preferences', 'BSD-3-Clause', 'https://pub.dev/packages/shared_preferences'],
  ['audioplayers', 'MIT', 'https://pub.dev/packages/audioplayers'],
] as const;

function Table({
  rows,
}: {
  rows: ReadonlyArray<readonly [string, string, string]>;
}) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[var(--edge)]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-white/[0.03]">
            <th className="px-4 py-3 text-left font-display text-xs font-bold tracking-widest text-ink-faint">
              PACKAGE
            </th>
            <th className="px-4 py-3 text-left font-display text-xs font-bold tracking-widest text-ink-faint">
              LICENCE
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, licence, url]) => (
            <tr key={name} className="border-t border-[var(--edge)]">
              <td className="px-4 py-3">
                <a href={url} target="_blank" rel="noreferrer noopener">
                  {name}
                </a>
              </td>
              <td className="px-4 py-3 text-ink-dim">{licence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function LicensesPage() {
  return (
    <LegalPage
      title="Licenses"
      updated="20 September 2026"
      intro={
        <>
          Everything original to {APP_NAME} was created for it. The only
          third-party assets bundled anywhere are two open-licensed typefaces.
        </>
      }
    >
      <h2>Original work</h2>
      <p>
        All game code, game designs, game names, artwork, icons, colour system,
        user interface, sound effects and music in {APP_NAME} were created for
        this project. The same is true of this website&rsquo;s design and code.
      </p>

      <h3>Games and genres</h3>
      <p>
        Several games belong to long-established genres — maze chases, paddle
        games, block breakers, sliding tile puzzles, number grids, word
        searches. Each is an original implementation with its own name, rules,
        presentation, artwork and audio. No code, artwork, sound, character,
        level layout or branding has been copied from any other game, and no
        trademarked name, logo or sprite belonging to another company appears
        anywhere in the project.
      </p>

      <h3>Audio</h3>
      <p>
        Every sound effect and music track in the app was synthesised from
        scratch by a script included in the project, using only the Python
        standard library. No third-party samples, loops or recordings are used.
      </p>

      <h3>Artwork</h3>
      <p>
        The app icon, launch art, game tile artwork and in-game graphics are
        generated programmatically — by a generator script in the project, or
        by the app&rsquo;s own painting code at runtime. The particle sequence
        on this site&rsquo;s home page is generated in the browser from the
        same bolt mark the app icon uses. No third-party images are bundled.
      </p>

      <h2>Typefaces</h2>
      <p>
        Two typefaces are used, both under the{' '}
        <a
          href="https://openfontlicense.org/"
          target="_blank"
          rel="noreferrer noopener"
        >
          SIL Open Font License, Version 1.1
        </a>
        :
      </p>
      <ul>
        <li>
          <strong>Orbitron</strong> — Copyright The Orbitron Project Authors.
          Used for headings, scores and game titles.
        </li>
        <li>
          <strong>Inter</strong> — Copyright The Inter Project Authors. Used
          for body text.
        </li>
      </ul>
      <p>
        The OFL permits bundling these fonts in an application or website,
        including a commercial one, provided they are not sold on their own and
        the licence travels with them. Neither font has been modified, so
        neither Reserved Font Name is affected.
      </p>

      <h2>Website dependencies</h2>
      <Table rows={WEBSITE_DEPS} />
      <p>
        GSAP is used here under its standard &ldquo;no charge&rdquo; licence,
        which covers websites that do not sell access to the GSAP-powered
        content. This site gives the app away for free and charges for nothing,
        so it qualifies. If that ever changes, review the licence terms.
      </p>

      <h2>Application dependencies</h2>
      <Table rows={APP_DEPS} />
      <p>
        The app also displays a complete, automatically generated list of its
        transitive dependencies and their full licence texts, under{' '}
        <strong>About → Open-source licences</strong>. That list is generated
        from the shipping build, so it is always accurate for the version you
        have installed.
      </p>

      <h2>Copyright</h2>
      <p>
        © 2026 {CREATOR_NAME}. All rights reserved. The source code and
        original assets of {APP_NAME} are the property of the author and are
        not licensed for redistribution.
      </p>
    </LegalPage>
  );
}
