import Link from 'next/link';

import { APP_NAME, CREATOR_NAME, SUPPORT_URL } from '@/config/site';

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { href: '#about-app', label: 'About the app' },
      { href: '#categories', label: 'Categories' },
      { href: '#library', label: 'All 50 games' },
      { href: '#download', label: 'Download' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Use' },
      { href: '/licenses', label: 'Licenses' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { href: '#install', label: 'Installation guide' },
      { href: '#faq', label: 'FAQ' },
      { href: SUPPORT_URL, label: 'Support' },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-[var(--edge)] bg-deep">
      <div className="shell py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <p className="display text-gradient text-lg">
              {APP_NAME.toUpperCase()}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-faint">
              Fifty original games in one offline Android app. No ads, no
              tracking, no account.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="eyebrow">{column.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => {
                  const className =
                    'text-sm text-ink-dim transition-colors hover:text-ink';
                  // An in-page anchor and an off-site URL are both fine in a
                  // plain <a>; a route is not, because only next/link adds
                  // the base path a project site is served from.
                  const isRoute =
                    link.href.startsWith('/') && !link.href.startsWith('//');
                  return (
                    <li key={link.href}>
                      {isRoute ? (
                        <Link href={link.href} className={className}>
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className={className}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        <div className="hairline my-10" />

        <div className="flex flex-col gap-3 text-xs text-ink-ghost sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {CREATOR_NAME}. All rights reserved.
          </p>
          <p>
            {APP_NAME} is not affiliated with Google, Apple, or any other
            company whose products are mentioned.
          </p>
        </div>
      </div>
    </footer>
  );
}
